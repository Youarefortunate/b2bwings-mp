Component({
  data: {
    visible: false,
  },

  methods: {
    handlePopup() {
      this.setData({ visible: true });
    },

    onVisibleChange(event) {
      this.setData({
        visible: event.detail.visible,
      });
    },
  },
});
