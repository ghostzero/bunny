import { assert } from "@std/assert";
import { signUrl } from "./mod.ts";

Deno.test(async function testSignUrl() {
    const signedUrl = await signUrl("https://example.com", "foo-bar");

    assert(signedUrl.includes("?token"), "URL is null");
});
