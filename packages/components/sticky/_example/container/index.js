Component({
  properties: {
    navbarHeight: {
      type: Number,
      value: 0,
    },
  },

  data: {
    container: null,
  },

  lifetimes: {
    ready() {
      this.setData({
        container: () => this.createSelectorQuery().select(".wrapper"),
      });
    },
  },
});
