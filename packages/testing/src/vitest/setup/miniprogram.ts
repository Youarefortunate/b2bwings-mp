import { vi } from "vitest";

const createMockConstructor = (name: string) => {
  return vi.fn((options: any) => {
    return {
      __type: name,
      options,
    };
  });
};

/** 创建小程序 wx 全局对象 mock */
export function createMiniprogramWxMock() {
  const wxMock: Record<PropertyKey, any> = {
    getSystemInfoSync: vi.fn(() => ({
      brand: "mock-brand",
      model: "mock-model",
      system: "mock-system",
    })),
  };

  // 动态代理 wx 对象上的所有属性
  return new Proxy(wxMock, {
    get(target, property) {
      if (!(property in target)) {
        target[property] = vi.fn();
      }

      return target[property];
    },
  }) as WechatMiniprogram.Wx;
}

(globalThis as any).App = createMockConstructor("App");
(globalThis as any).Page = createMockConstructor("Page");
(globalThis as any).Component = createMockConstructor("Component");
(globalThis as any).Behavior = createMockConstructor("Behavior");
(globalThis as any).wx = createMiniprogramWxMock();
