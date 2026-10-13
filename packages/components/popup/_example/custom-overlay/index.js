Component({
  data: {
    visible: false,
    showOverlay: true,
    overlayProps: {},
    contentText: "",
  },

  methods: {
    handlePopup(event) {
      const { type } = event.currentTarget.dataset;
      if (type === "custom-color") {
        this.setData({
          showOverlay: true,
          overlayProps: {
            backgroundColor: "rgba(0, 82, 217, 0.3)",
          },
          contentText: "此弹出层具有自定义遮罩背景色 (蓝色半透明)",
          visible: true,
        });
      } else if (type === "no-overlay") {
        this.setData({
          showOverlay: false,
          overlayProps: {},
          contentText: "此弹出层无遮罩层，可以点击背景其他区域进行交互",
          visible: true,
        });
      }
    },

    onVisibleChange(event) {
      this.setData({
        visible: event.detail.visible,
      });
    },

    onClose() {
      this.setData({
        visible: false,
      });
    },
  },
});
