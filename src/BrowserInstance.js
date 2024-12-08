export default async function getBrowserInstance()
{
  // Launch the browser in headless mode (no UI)
  return await chromium.launch({
    executablePath: "/snap/bin/brave"
  });
}