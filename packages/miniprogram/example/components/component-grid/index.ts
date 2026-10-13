Component({
  properties: {
    list: {
      type: Array,
      value: [],
      observer(newVal) {
        if (newVal && newVal.length > 0) {
          this.initSvgUrls();
        }
      },
    },
  },

  data: {
    formattedList: [] as any[],
    visibleMap: {} as Record<string, boolean>,
  },

  lifetimes: {
    detached() {
      this.cleanObservers();
    },
  },

  methods: {
    cleanObservers() {
      const observers = (this as any)._observersList;
      if (observers && observers.length) {
        observers.forEach((obs: any) => obs.disconnect());
        (this as any)._observersList = [];
      }
    },

    initSvgUrls() {
      const formattedList = this.properties.list.map((group: any) => {
        const childArr = group.childArr.map((child: any) => {
          return {
            ...child,
            svgUrl: `./assets/${child.name}.svg`,
          };
        });
        return {
          ...group,
          childArr,
        };
      });

      this.setData(
        {
          formattedList,
        },
        () => {
          this.initObservers();
        },
      );
    },

    initObservers() {
      this.cleanObservers();

      const observersList = ((this as any)._observersList = [] as any[]);
      const formattedList = this.data.formattedList;
      if (!formattedList || formattedList.length === 0) return;

      this.createSelectorQuery()
        .select(".component-grid")
        .boundingClientRect(() => {
          formattedList.forEach((group: any, parentIndex: number) => {
            group.childArr.forEach((child: any, index: number) => {
              const key = `${parentIndex}_${index}`;
              const className = `.grid-item-observer-${parentIndex}-${index}`;

              const observer = this.createIntersectionObserver({
                thresholds: [0.01],
              });

              observer
                .relativeToViewport({ bottom: 0, top: 0 })
                .observe(className, (res) => {
                  const isVisible = res.intersectionRatio > 0;
                  this.setData({
                    [`visibleMap.${key}`]: isVisible,
                  });
                });

              observersList.push(observer);
            });
          });
        })
        .exec();
    },

    onImageError(e: any) {
      const { index, parentindex } = e.currentTarget.dataset;
      const key = `formattedList[${parentindex}].childArr[${index}].svgUrl`;
      this.setData({
        [key]: "./assets/default.svg",
      });
    },

    onCardTap(e: any) {
      const { item } = e.currentTarget.dataset;
      this.triggerEvent("click", { item });
    },
  },
});
