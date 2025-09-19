# adapter.py
import asyncio
import aiohttp
import json
import os

MI_ENDPOINT = os.environ.get("MI_ENDPOINT", "http://wso2mi:8290/cms-proxy/wms_tcp_receive")

async def handle_client(reader, writer):
    addr = writer.get_extra_info('peername')
    print("Connection from", addr)
    while True:
        data = await reader.readline()
        if not data:
            break
        msg = data.decode().strip()
        print("TCP message:", msg)
        # parse proprietary message -> build JSON
        try:
            # Try to parse message as JSON if possible
            try:
                msg_data = json.loads(msg)
                if not isinstance(msg_data, dict):
                    msg_data = {"raw": msg}
            except json.JSONDecodeError:
                # If not valid JSON, try to parse proprietary format
                parts = msg.split('|')
                if len(parts) >= 2:
                    # Basic parsing of format like "ORDER:123|EVENT:scanned"
                    msg_data = {}
                    for part in parts:
                        if ':' in part:
                            k, v = part.split(':', 1)
                            msg_data[k.lower()] = v
                    # Default event type if not specified
                    if 'event' not in msg_data and 'order_id' in msg_data:
                        msg_data['event'] = 'received'
                else:
                    msg_data = {"raw": msg}
            
            # Forward to WSO2 MI
            async with aiohttp.ClientSession() as sess:
                print(f"Sending to {MI_ENDPOINT}: {msg_data}")
                response = await sess.post(MI_ENDPOINT, json=msg_data, timeout=5)
                print(f"Response status: {response.status}")
                
        except Exception as e:
            print("Error posting to MI:", e)
    writer.close()

async def main():
    server = await asyncio.start_server(handle_client, '0.0.0.0', 9000)
    async with server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())
