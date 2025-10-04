import { Sandbox } from "@e2b/code-interpreter";
import { SANDBOX_TIMEOUT } from "@/lib/utils/types";
export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  await sandbox.setTimeout(SANDBOX_TIMEOUT);
  return sandbox;
}
