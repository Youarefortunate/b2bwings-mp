Component({
  data: {
    imageUrl: "./placeholder.png",
    modalKey: "",
    imageOnTop: false,
    imageOnTopWithContent: false,
    imageOnTopWithTitle: false,
    imageOnMiddle: false,
    imageOnMiddleWithTitle: false,
    imageOnMiddleWithImage: false,
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
