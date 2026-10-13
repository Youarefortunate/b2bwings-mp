import { config } from "../index";

const { prefix } = config;

type TransitionDuration = number | [number, number];

type TransitionStatus = "" | "entering" | "entered" | "leaving" | "leaved";

interface TransitionBehaviorInstance {
  status: TransitionStatus;
  transitionTimer: number;
  customDuration: boolean;
  inited: boolean;
  transitionDurations: [number, number];
  properties: {
    visible: boolean | null;
    appear: boolean;
    name: string;
    durations?: TransitionDuration;
  };
  data: {
    visible: boolean | null;
    name: string;
    durations?: TransitionDuration;
    transitionDuration: number;
    transitionClass: string;
    realVisible: boolean;
  };
  setData(data: WechatMiniprogram.IAnyObject, callback?: () => void): void;
  triggerEvent: WechatMiniprogram.Component.TrivialInstance["triggerEvent"];
  getDurations(): [number, number];
  enter(): void;
  entered(): void;
  leave(): void;
  leaved(): void;
}

/**
 * 创建通用进出场过渡 Behavior
 */
export default () =>
  Behavior({
    properties: {
      /** 是否展示节点 */
      visible: {
        type: Boolean,
        value: null as unknown as boolean,
        observer: "watchVisible",
      },
      /** 初始化时是否执行进场动画 */
      appear: Boolean,
      /** 过渡类名前缀名称 */
      name: {
        type: String,
        value: "fade",
      },
      /** 进出场过渡时长 */
      durations: {
        type: Number,
        optionalTypes: [Array],
      },
    },

    data: {
      transitionClass: "",
      transitionDuration: 300,
      realVisible: false,
    },

    lifetimes: {
      created(this: TransitionBehaviorInstance) {
        this.status = "";
        this.transitionTimer = 0;
        this.customDuration = false;
        this.inited = false;
        this.transitionDurations = [300, 300];
      },

      attached(this: TransitionBehaviorInstance) {
        this.transitionDurations = this.getDurations();
        if (this.data.visible) {
          if (this.properties.appear) {
            this.enter();
          } else {
            this.setData({
              realVisible: true,
              transitionClass: "",
            });
          }
        }
        this.inited = true;
      },

      detached(this: TransitionBehaviorInstance) {
        clearTimeout(this.transitionTimer);
      },
    },

    methods: {
      watchVisible(
        this: TransitionBehaviorInstance,
        curr: boolean,
        prev: boolean,
      ) {
        if (this.inited && curr !== prev) {
          curr ? this.enter() : this.leave();
        }
      },

      getDurations(this: TransitionBehaviorInstance): [number, number] {
        const { durations, transitionDuration } = this.data;
        if (Array.isArray(durations)) {
          return [Number(durations[0]), Number(durations[1])];
        }
        const duration = Number(durations || transitionDuration);
        return [duration, duration];
      },

      enter(this: TransitionBehaviorInstance) {
        const { name } = this.data;
        const [duration] = this.getDurations();
        this.status = "entering";
        this.setData({
          realVisible: true,
          transitionClass: `${prefix}-${name}-enter ${prefix}-${name}-enter-active`,
        });
        clearTimeout(this.transitionTimer);
        setTimeout(() => {
          this.setData({
            transitionClass: `${prefix}-${name}-enter-active ${prefix}-${name}-enter-to`,
          });
        }, 30);
        this.transitionTimer = setTimeout(
          this.entered.bind(this),
          duration + 30,
        ) as unknown as number;
      },

      entered(this: TransitionBehaviorInstance) {
        this.customDuration = false;
        clearTimeout(this.transitionTimer);
        this.status = "entered";
        this.setData({
          transitionClass: "",
        });
      },

      leave(this: TransitionBehaviorInstance) {
        const { name } = this.data;
        const [, duration] = this.getDurations();
        this.status = "leaving";
        this.setData({
          transitionClass: `${prefix}-${name}-leave ${prefix}-${name}-leave-active`,
        });
        clearTimeout(this.transitionTimer);
        setTimeout(() => {
          this.setData({
            transitionClass: `${prefix}-${name}-leave-active ${prefix}-${name}-leave-to`,
          });
        }, 30);
        this.customDuration = true;
        this.transitionTimer = setTimeout(
          this.leaved.bind(this),
          duration + 30,
        ) as unknown as number;
      },

      leaved(this: TransitionBehaviorInstance) {
        this.customDuration = false;
        this.triggerEvent("leaved");
        clearTimeout(this.transitionTimer);
        this.status = "leaved";
        this.setData({
          transitionClass: "",
          realVisible: false,
        });
      },

      onTransitionEnd(this: TransitionBehaviorInstance) {
        if (this.customDuration) return;
        clearTimeout(this.transitionTimer);
        if (this.status === "entering" && this.data.visible) {
          this.entered();
        } else if (this.status === "leaving" && !this.data.visible) {
          this.leaved();
        }
      },
    },
  });
