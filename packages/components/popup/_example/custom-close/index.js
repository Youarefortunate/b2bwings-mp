Component({
  data: {
    visible: false,
  },

  methods: {
    handlePopup() {
      this.setData({ visible: true });
    },

    onClose() {
      this.setData({ visible: false });
    },

    onVisibleChange(event) {
      this.setData({
        visible: event.detail.visible,
      });
    },
  },
});
