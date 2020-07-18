import { Application, Context, Router, helpers } from "./worker_deps.ts";
import { getDocs } from "./doc.ts";

const app = new Application();

const controller = new AbortController();
const { signal } = controller;

const router = new Router();
router.get("/api/docs", async (ctx: Context) => {
  const query = helpers.getQuery(ctx, { mergeParams: true });
  ctx.response.body = JSON.stringify(await getDocs(query.entrypoint));
});

router.get("/(.*)", async (ctx: Context) => {
  await ctx.send({
    root: `${Deno.cwd()}/doc_website/out`,
    index: "index.html",
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

let promise = app.listen({ port: 3000, signal });

self.onmessage = async (_) => {
  controller.abort();
  await promise;
  postMessage({});
  self.close();
};