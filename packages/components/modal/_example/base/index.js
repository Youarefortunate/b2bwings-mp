Component({
  data: {
    confirmBtn: { content: "知道了", variant: "base" },
    modalKey: "",
    showTextAndTitle: false,
    showContentOnly: false,
    showTitleOnly: false,
    showLongContent: false,
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
