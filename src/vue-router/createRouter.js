export function createRouter({ history, routes }) {
  const router = {
    install(app) {
      app.component("RouterLink", {
        render: (proxy) => {
          let { $slots } = proxy;
          return <div>{$slots.default()}</div>;
        },
      });
    },
  };
  return router;
}
