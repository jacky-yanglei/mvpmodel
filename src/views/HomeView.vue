<script setup lang="ts">
import { reactive, ref, toRaw } from "vue";
import axios from "axios";
import { message } from "ant-design-vue";
const [messageApi, contextHolder] = message.useMessage();

const optionsColumns = [
  // {
  //   title: "币种",
  //   dataIndex: "name",
  //   key: "name",
  // },
  {
    title: "买/卖",
    dataIndex: "direction",
    key: "direction",
  },
  {
    title: "认购/认沽",
    dataIndex: "valuation",
    key: "valuation",
  },
  {
    title: "行权价",
    key: "exercisePrice",
    dataIndex: "exercisePrice",
  },
  {
    title: "期权价格",
    key: "mCap",
    dataIndex: "mCap",
  },
  {
    title: "数量",
    key: "amount",
    dataIndex: "amount",
  },
  {
    title: "操作",
    width: "150px",
    key: "action",
    dataIndex: "action",
  },
];

const optionsData = reactive(
  [] as {
    name: string;
    direction: string;
    valuation: string;
    exercisePrice: string;
    mCap: string;
    amount: string;
  }[]
);

const holdColumns = [
  {
    title: "币种",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "数量",
    key: "amount",
    dataIndex: "amount",
  },
  {
    title: "成本价",
    key: "costPrice",
    dataIndex: "costPrice",
  },
  {
    title: "操作",
    width: '150px',
    key: "action",
    dataIndex: "action",
  },
];
const holdData = reactive(
  [] as {
    name: string;
    amount: string;
    costPrice: string;
  }[]
);
const addOptions = () => {
  addOptionsModal.post = true;
  if (
    // addOptionsModal.name &&
    addOptionsModal.direction &&
    addOptionsModal.valuation &&
    addOptionsModal.exercisePrice &&
    addOptionsModal.mCap &&
    addOptionsModal.amount
  ) {
    if (addOptionsModal.isEdit) {
      optionsData[addOptionsModal?.editIndex || 0] = {
        name: addOptionsModal.name,
        direction: addOptionsModal.direction,
        valuation: addOptionsModal.valuation,
        exercisePrice: addOptionsModal.exercisePrice,
        mCap: addOptionsModal.mCap,
        amount: addOptionsModal.amount,
      };
    } else {
      optionsData.push({
        name: addOptionsModal.name,
        direction: addOptionsModal.direction,
        valuation: addOptionsModal.valuation,
        exercisePrice: addOptionsModal.exercisePrice,
        mCap: addOptionsModal.mCap,
        amount: addOptionsModal.amount,
      });
    }
    addOptionsModal.visible = false;
  }
};

const addHold = () => {
  addHoldModal.post = true;
  if (addHoldModal.name && addHoldModal.amount && addHoldModal.costPrice) {
    if (addHoldModal.isEdit) {
      holdData[addHoldModal?.editIndex || 0] = {
        name: addHoldModal.name,
        amount: addHoldModal.amount,
        costPrice: addHoldModal.costPrice,
      };
    } else {
      holdData.push({
        name: addHoldModal.name,
        amount: addHoldModal.amount,
        costPrice: addHoldModal.costPrice,
      });
    }
    addHoldModal.visible = false;
  }
};

const addOptionsModal = reactive({
  visible: false,
  name: "BTC",
  direction: "sell",
  valuation: "call",
  exercisePrice: "2",
  mCap: "20",
  amount: "1",
  isEdit: false,
  editIndex: null as number | null,
  post: false,
});
const addHoldModal = reactive({
  visible: false,
  name: "BTC",
  amount: "1",
  costPrice: "200",
  isEdit: false,
  editIndex: null as null | number,
  post: false,
});

const openOptionsModal = () => {
  addOptionsModal.visible = true;
  addOptionsModal.name = "";
  addOptionsModal.amount = "";
  addOptionsModal.direction = "sell";
  addOptionsModal.valuation = "call";
  addOptionsModal.exercisePrice = "";
  addOptionsModal.mCap = "";
  addOptionsModal.isEdit = false;
  addOptionsModal.editIndex = null;
  addOptionsModal.post = false;
};
const openHoldModal = () => {
  addHoldModal.visible = true;
  addHoldModal.name = "";
  addHoldModal.costPrice = "";
  addHoldModal.amount = "";
  addHoldModal.isEdit = false;
  addHoldModal.editIndex = null;
  addHoldModal.post = false;
};

const removeOptions = (index: number) => {
  optionsData.splice(index, 1);
};

const editOptions = (index: number) => {
  addOptionsModal.isEdit = true;
  addOptionsModal.editIndex = index;
  addOptionsModal.name = optionsData[index].name;
  addOptionsModal.amount = optionsData[index].amount;
  addOptionsModal.direction = optionsData[index].direction;
  addOptionsModal.valuation = optionsData[index].valuation;
  addOptionsModal.exercisePrice = optionsData[index].exercisePrice;
  addOptionsModal.mCap = optionsData[index].mCap;
  addOptionsModal.visible = true;
};

const removeHold = (index: number) => {
  holdData.splice(index, 1);
};
const editHold = (index: number) => {
  addHoldModal.isEdit = true;
  addHoldModal.editIndex = index;
  addHoldModal.name = holdData[index].name;
  addHoldModal.costPrice = holdData[index].costPrice;
  addHoldModal.amount = holdData[index].amount;
  addHoldModal.visible = true;
};

const xLiable = reactive({
  minPrice: "5",
  maxPrice: "30",
  priceStep: "0.1",
});

const draw = async () => {
  spinning.value = true;
  try {
    let holdList = toRaw(holdData).map((item) => {
      return {
        classes: "hold",
        amount: item.amount,
        symbol: item.name,
        buying_price: item.costPrice,
      };
    });
    let optionsList = toRaw(optionsData).map((item) => {
      return {
        classes: "option",
        amount: item.amount,
        symbol: optionSymbol.value,
        buy_sell: item.direction,
        call_put: item.valuation,
        strike_price: item.exercisePrice,
        premium: item.mCap,
      };
    });
    let arr: any[] = holdList.concat(optionsList as any[]);
    if (arr.length === 0) {
      throw Error("期权资产、现货资产不能都为空");
    }
    let data = await axios({
      method: "post",
      url:
        import.meta.env.MODE === "development"
          ? "/opts/"
          : "http://home.oceanforex.com:8001/opts/",
      params: {
        min_price: xLiable.minPrice,
        max_price: xLiable.maxPrice,
        price_step: xLiable.priceStep,
      },
      data: arr,
    });
    let imgSrc = "data:image/jpeg;base64," + data.data.plot_code;
    chartSrc.value = imgSrc;
  } catch (e: any) {
    message.error(e?.reason || e.data?.message || e?.message);
  }
  spinning.value = false;
};
let chartSrc = ref("");
let spinning = ref(false);
let optionSymbol = ref("");
</script>

<template>
  <a-spin tip="Loading..." :spinning="spinning">
    <main class="main">
      <a-row :gutter="[8, 0]">
        <a-col :span="12">
          <a-row :gutter="[0, 8]">
            <a-col :span="24">
              <div class="half-screen block">
                <div class="title">
                  <div style="display: flex; align-item: center">
                    期权资产
                    <a-input
                      style="
                        margin-left: 8px;
                        width: 120px;
                        background-color: #e7e7e7;
                      "
                      placeholder="期权symbol"
                      v-model:value="optionSymbol"
                    ></a-input>
                  </div>
                  <div>
                    <a-button type="primary" @click="openOptionsModal()"
                      >+ 添加
                    </a-button>
                  </div>
                </div>
                <a-table
                  :pagination="false"
                  :columns="optionsColumns"
                  :scroll="{ x: 500, y: 200 }"
                  :data-source="optionsData"
                >
                  <template #bodyCell="{ column, index }">
                    <template v-if="column.key === 'action'">
                      <div>
                        <a-button style="margin-right: 8px;" type="primary" @click="editOptions(index)"
                          >编辑</a-button
                        >
                        <a-button
                          type="primary"
                          @click="removeOptions(index)"
                          danger
                          >删除</a-button
                        >
                      </div>
                    </template>
                  </template>
                </a-table>
              </div>
            </a-col>
            <a-col :span="24">
              <div class="half-screen block">
                <div class="title">
                  <div>现货资产</div>
                  <div>
                    <a-button type="primary" @click="openHoldModal()"
                      >+ 添加
                    </a-button>
                  </div>
                </div>
                <a-table
                  :pagination="false"
                  :columns="holdColumns"
                  :scroll="{ y: 200 }"
                  :data-source="holdData"
                >
                  <template #bodyCell="{ column, index }">
                    <template v-if="column.key === 'action'">
                      <a-button style="margin-right: 8px;" type="primary" @click="editHold(index)"
                        >编辑</a-button
                      >
                      <a-button type="primary" @click="removeHold(index)" danger
                        >删除</a-button
                      >
                    </template>
                  </template>
                </a-table>
              </div>
            </a-col>
          </a-row>
        </a-col>
        <a-col :span="12">
          <div class="full-screen block">
            <div class="title">
              <div>期权盈亏曲线图</div>
            </div>
            <div>
              <div class="changeRange">
                <div>
                  <span style="margin-right: 8px">X轴区间范围</span>
                  <a-input
                    v-model:value="xLiable.minPrice"
                    placeholder="Min price"
                  ></a-input>
                  <span style="margin-right: 4px; margin-left: 4px">-</span>
                  <a-input
                    v-model:value="xLiable.maxPrice"
                    placeholder="Max price"
                  ></a-input>
                  <span style="margin-left: 16px; margin-right: 8px">步长</span>
                  <a-input
                    v-model:value="xLiable.priceStep"
                    placeholder="步长"
                  ></a-input>
                </div>
                <div>
                  <a-button type="primary" @click="draw()">开始绘图</a-button>
                </div>
              </div>
              <div class="chart">
                <img style="width: 100%" :src="chartSrc" alt="" />
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
      <a-modal
        v-model:open="addOptionsModal.visible"
        title="添加期权资产"
        ok-text="确认"
        cancel-text="取消"
        @ok="addOptions()"
      >
        <div class="form">
          <!-- <div>
            <div
              :class="
                !addOptionsModal.name && addOptionsModal.post ? 'error' : ''
              "
            >
              币种
            </div>
            <div>
              <a-input
                :status="
                  !addOptionsModal.name && addOptionsModal.post ? 'error' : ''
                "
                v-model:value="addOptionsModal.name"
              ></a-input>
            </div>
          </div> -->
          <div>
            <div>买卖方向</div>
            <div>
              <a-select v-model:value="addOptionsModal.direction">
                <a-select-option value="sell">Sell</a-select-option>
                <a-select-option value="buy">Buy</a-select-option>
              </a-select>
            </div>
          </div>
          <div>
            <div>认购认沽</div>
            <div>
              <a-select v-model:value="addOptionsModal.valuation">
                <a-select-option value="call">认购</a-select-option>
                <a-select-option value="put">认沽</a-select-option>
              </a-select>
            </div>
          </div>
          <div>
            <div
              :class="
                !addOptionsModal.exercisePrice && addOptionsModal.post
                  ? 'error'
                  : ''
              "
            >
              行权价
            </div>
            <div>
              <a-input
                :status="
                  !addOptionsModal.exercisePrice && addOptionsModal.post
                    ? 'error'
                    : ''
                "
                type="number"
                v-model:value="addOptionsModal.exercisePrice"
              ></a-input>
            </div>
          </div>
          <div>
            <div
              :class="
                !addOptionsModal.mCap && addOptionsModal.post ? 'error' : ''
              "
            >
              期权价格
            </div>
            <div>
              <a-input
                :status="
                  !addOptionsModal.mCap && addOptionsModal.post ? 'error' : ''
                "
                type="number"
                v-model:value="addOptionsModal.mCap"
              ></a-input>
            </div>
          </div>
          <div>
            <div
              :class="
                !addOptionsModal.amount && addOptionsModal.post ? 'error' : ''
              "
            >
              数量
            </div>
            <div>
              <a-input
                :status="
                  !addOptionsModal.amount && addOptionsModal.post ? 'error' : ''
                "
                type="number"
                v-model:value="addOptionsModal.amount"
              ></a-input>
            </div>
          </div>
        </div>
      </a-modal>
      <a-modal
        v-model:open="addHoldModal.visible"
        title="添加现货资产"
        ok-text="确认"
        cancel-text="取消"
        @ok="addHold()"
      >
        <div class="form">
          <div>
            <div
              :class="!addHoldModal.name && addHoldModal.post ? 'error' : ''"
            >
              币种
            </div>
            <div>
              <a-input
                :status="!addHoldModal.name && addHoldModal.post ? 'error' : ''"
                v-model:value="addHoldModal.name"
              ></a-input>
            </div>
          </div>
          <div>
            <div
              :class="
                !addHoldModal.costPrice && addHoldModal.post ? 'error' : ''
              "
            >
              costPrice
            </div>
            <div>
              <a-input
                :status="
                  !addHoldModal.costPrice && addHoldModal.post ? 'error' : ''
                "
                type="number"
                v-model:value="addHoldModal.costPrice"
              ></a-input>
            </div>
          </div>
          <div>
            <div
              :class="!addHoldModal.amount && addHoldModal.post ? 'error' : ''"
            >
              数量
            </div>
            <div>
              <a-input
                :status="
                  !addHoldModal.amount && addHoldModal.post ? 'error' : ''
                "
                type="number"
                v-model:value="addHoldModal.amount"
              ></a-input>
            </div>
          </div>
        </div>
      </a-modal>
    </main>
  </a-spin>
</template>
<style lang="less">
.ant-table-wrapper .ant-table-thead > tr > th {
  padding: 4px 0;
  text-align: center;
}
.ant-table-wrapper .ant-table-tbody > tr > td {
  padding: 4px 0;
  text-align: center;
  text-transform: capitalize;
}
</style>
<style lang="less" scoped>
.main {
  width: 1200px;
  margin: 0 auto;
  padding-top: 40px;
}
.block {
  padding: 16px;
}
.title {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
  > div {
    font-weight: bold;
  }
}
.full-screen {
  height: 608px;
  background-color: white;
  border-radius: 8px;
}
.half-screen {
  height: 300px;
  background-color: white;
  border-radius: 8px;
}
.changeRange {
  display: flex;
  justify-content: space-between;
  align-items: center;
  > div:first-child {
    display: flex;
    align-items: center;
  }
  .ant-input {
    width: 100px;
    background-color: #e7e7e7;
  }
}
.chart {
  margin-top: 12px;
}
.form {
  > div {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    > div:first-child {
      margin-right: 8px;
      &.error {
        color: red;
      }
    }
  }
}
</style>