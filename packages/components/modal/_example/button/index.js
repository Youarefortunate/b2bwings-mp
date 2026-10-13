import Modal from "xbd-miniprogram/modal/index";

Component({
  methods: {
    showModal() {
      Modal.confirm({
        context: this,
        title: "模态框标题",
        content: "告知当前状态、信息和解决方法等内容",
        cancelBtn: "取消",
        confirmBtn: {
          openType: "share",
          content: "分享给朋友",
        },
      });
    },
  },
});
