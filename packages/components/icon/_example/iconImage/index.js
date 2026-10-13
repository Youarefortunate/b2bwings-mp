Component({
  data: {
    imageIconList: [
      "https://img.yzcdn.cn/vant/cat.jpeg",
      "https://img.yzcdn.cn/vant/cat.jpeg",
    ],
  },

  methods: {
    onIconTap(event) {
      const { name, type } = event.currentTarget.dataset;
      if (type === "prefix") return;
      wx.showToast({ title: name, icon: "none", duration: 1000 });
    },
  },
});
