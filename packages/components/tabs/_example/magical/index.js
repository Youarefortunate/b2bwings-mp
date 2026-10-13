Component({
  methods: {
    onTabsChange(event) {
      console.log(`Change tab, tab-item value is ${event.detail.value}.`);
    },

    onTabsClick(event) {
      console.log(`Click tab, tab-item value is ${event.detail.value}.`);
    },
  },
});
