Component({
  data: {
    stickyProps: {
      zIndex: 100,
    },
  },
  methods: {
    onTabsChange(event) {
      console.log(`Change tab, tab-item value is ${event.detail.value}.`);
    },

    onTabsClick(event) {
      console.log(`Click tab, tab-item value is ${event.detail.value}.`);
    },

    onStickyScroll(event) {
      console.log(event.detail);
    },
  },
});
