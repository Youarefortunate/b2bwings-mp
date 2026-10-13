Component({
  data: {
    confirmBtn: { content: "确定", variant: "base" },
    modalKey: "",
    showConfirm: false,
    showWarnConfirm: false,
    showLightConfirm: false,
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
