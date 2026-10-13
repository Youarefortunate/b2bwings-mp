Component({
  data: {
    confirmBtn: { content: "确定", variant: "base" },
    modalKey: "",
    showConfirm: false,
    showWarnConfirm: false,
    showTooLongBtnContent: false,
    showMultiBtn: false,
    showCloseBtn: false,
    multiBtnList: [
      { content: "次要按钮", theme: "light" },
      { content: "次要按钮", theme: "light" },
      { content: "主要按钮", theme: "primary" },
    ],
  },

  methods: {
    showModal(event) {
      const { key } = event.currentTarget.dataset;
      this.setData({ [key]: true, modalKey: key });
    },

    closeModal() {
      const { modalKey } = this.data;
      this.setData({ [modalKey]: false });
    },
  },
});
