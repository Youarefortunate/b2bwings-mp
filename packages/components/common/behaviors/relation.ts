/**
 * 根据关系类别与关联路径创建用于注入便捷访问器的 Behavior
 * @param relation 关系分类："parent" (父组件访问器 $parent) 或 "children" (子组件访问器 $children)
 * @param path 关联关系的目标路径，例如 "../tabs/tabs"
 */
export default (relation: "parent" | "children", path: string) =>
  Behavior({
    created() {
      Object.defineProperty(this, `$${relation}`, {
        get: () => {
          const nodes = this.getRelationNodes(path) || [];
          return relation === "parent" ? nodes[0] : nodes;
        },
      });
    },
  });
