import asyncio
import uuid
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from sse_starlette.sse import EventSourceResponse
from vllm.engine.arg_utils import AsyncEngineArgs
from vllm.engine.async_llm_engine import AsyncLLMEngine
from vllm.sampling_params import SamplingParams

app = FastAPI()

# --- 1. vLLM Engine Initialization (using StableLM Zephyr 3B) ---
print("Loading TheBloke/stablelm-zephyr-3b-GPTQ model...")
engine_args = AsyncEngineArgs(
    model="TheBloke/stablelm-zephyr-3b-GPTQ",
    quantization="gptq",
    tensor_parallel_size=1,
    gpu_memory_utilization=0.8,
    trust_remote_code=True,
    dtype="half"
)
llm = AsyncLLMEngine.from_engine_args(engine_args)

@app.on_event("startup")
async def startup_event():
    app.state.tokenizer = await llm.get_tokenizer()
    print("✅ Async model and tokenizer loaded successfully!")

# --- 2. API Endpoint for Chat ---
@app.post("/chat")
async def chat_endpoint(request: Request):
    request_data = await request.json()
    chat_history = request_data.get("messages", [])
    tokenizer = request.app.state.tokenizer
    prompt = tokenizer.apply_chat_template(
        chat_history, tokenize=False, add_generation_prompt=True
    )
    sampling_params = SamplingParams(temperature=0.7, top_p=0.95, max_tokens=512)
    request_id = f"chatcmpl-{uuid.uuid4()}"
    stream_generator = llm.generate(prompt, sampling_params, request_id)

    async def event_generator():
        full_response = ""
        async for output in stream_generator:
            latest_text = output.outputs[0].text
            new_token = latest_text[len(full_response):]
            full_response = latest_text
            yield new_token
    return EventSourceResponse(event_generator())

# --- 3. Endpoint to Serve the single HTML file ---
@app.get("/")
async def get_index():
    return FileResponse("index.html")
