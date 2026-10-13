Component({
  data: {
    modalKey: "",
    showWithInput: false,
    showTextAndTitleWithInput: false,
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
