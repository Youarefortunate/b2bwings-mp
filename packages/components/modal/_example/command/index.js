import Modal from "xbd-miniprogram/modal/index";

Component({
  methods: {
    showModal() {
      Modal.confirm({
        context: this,
        title: "模态框标题",
        closeOnOverlayClick: true,
        content: "告知当前状态、信息和解决方法等内容",
        confirmBtn: "确定",
        cancelBtn: "取消",
      });
    },
  },
});
