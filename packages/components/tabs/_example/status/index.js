Component({
  data: {
    value: "0",
  },
  methods: {
    onTabsChange(event) {
      this.setData({
        value: event.detail.value,
      });
      console.log(`Change tab, tab-item value is ${event.detail.value}.`);
    },

    onTabsClick(event) {
      console.log(`Click tab, tab-item value is ${event.detail.value}.`);
    },
  },
});
