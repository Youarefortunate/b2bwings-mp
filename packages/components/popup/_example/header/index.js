Component({
  data: {
    visible: false,
    mode: "left",
    titleMap: {
      left: "左侧标题",
      center: "居中标题",
      right: "右侧标题",
      long: "这是一段非常长的弹出层头部标题内容用于验证单行省略且不会与关闭按钮重叠",
      noClose: "无关闭图标标题",
      reverse: "关闭图标在左侧",
      subtitleLeft: "左侧标题",
      subtitleCenter: "居中标题",
      customTitle: "自定义标题内容",
      customClose: "自定义关闭图标",
      custom: "完全自定义头部",
    },
    subtitleMap: {
      subtitleLeft: "左侧副标题文案，过长时同样需要单行省略显示",
      subtitleCenter: "居中副标题文案，过长时同样需要单行省略显示",
    },
  },

  methods: {
    handlePopup(event) {
      const { mode } = event.currentTarget.dataset;

      this.setData({
        mode,
        visible: true,
      });
    },

    handleClose() {
      this.setData({
        visible: false,
      });
    },

    onVisibleChange(event) {
      this.setData({
        visible: event.detail.visible,
      });
    },
  },
});
