<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表 -->
      <el-table ref="table" :data="orderList" border stripe @expand-change="getGoodsList"
                @row-click="handleColumnClick">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品列表" row-key="keyId" type="expand">
          <template slot-scope="prop">
            <div>
              <el-table :data="prop.row.goodsList" border>
                <el-table-column label="商品名称" prop="goodInfo.goodName"></el-table-column>
                <el-table-column label="商品数量" prop="goodNum"></el-table-column>
                <el-table-column label="商品单价" prop="goodInfo.goodPrice.price"></el-table-column>
                <el-table-column label="商品总格" prop="goodsTotalPrice"></el-table-column>
              </el-table>
              <el-card>
                <div>
                  用户信息
                </div>
                <div class="addr-info">
                  <label v-if="!prop.row.editAddr" class="text-attr">
                    收货地址：{{ prop.row.address }}
                  </label>
                  <el-button icon="el-icon-edit" size="mini" type="primary" @click.stop="showEditDialog(prop.row)">
                    {{ prop.row.editAddr ? "保存" : "编辑" }}
                  </el-button>

                </div>
                <div class="addr-info">
                  <label v-if="!prop.row.editDetailAddr" class="text-attr">
                    详细地址：{{ prop.row.detailAddr }}
                  </label>
                </div>
              </el-card>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单编号" prop="id"></el-table-column>
        <el-table-column label="订单价格" prop="totalPrice"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isPay" size="mini" type="danger">未付款</el-tag>
            <el-tag v-else size="mini" type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="isSend"></el-table-column>
        <el-table-column label="下单时间" prop="createTime"></el-table-column>
        <el-table-column label="操作">
          <template slot>
            <el-button
                icon="el-icon-location"
                size="mini"
                type="success"
                @click.stop="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
          :current-page="queryInfo.current"
          :page-size="queryInfo.size"
          :page-sizes="[5, 10, 15, 20]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
        :visible.sync="addressDialogVisible"
        title="修改地址"
        width="50%"
        @close="addressDialogClosed"
    >
      <el-form
          ref="addressFormRef"
          :model="addressForm"
          :rules="addressFormRules"
          label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
              v-model="addressForm.address"
              :options="cityData"
              :props="{ expandTrigger: 'hover' ,
              lazy: true,
              lazyLoad (node, resolve){
              getAreaData(node,resolve)
              }}"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddr">
          <el-input v-model="addressForm.detailAddr"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false;">取 消</el-button>
        <el-button type="primary" @click="handleEditAddr()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度对话框 -->
    <el-dialog :visible.sync="progressDialogVisible" title="查看物流进度" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
        >{{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'MyOrder',
  data() {
    return {
      // 订单列表查询参数
      queryInfo: {
        query: '',
        current: 1,
        size: 10
      },
      total: 0,
      // 订单列表
      orderList: [
        {
          address: '',
          detailAddr: '',
          editAddr: false,
          editDetailAddr: false,
          goodsList: []
        }
      ],
      goodsList: [],
      // 修改地址对话框
      addressDialogVisible: false,
      addressForm: {
        address: [],
        detailAddr: ''
      },
      addressFormRules: {
        address: [
          {required: true, message: '请选择省市区县', trigger: 'blur'}
        ],
        detailAddr: [
          {required: true, message: '请输入详细地址', trigger: 'blur'}
        ]
      },
      cityData: [],
      // 物流进度对话框
      progressDialogVisible: false,
      // 物流进度
      progressInfo: [],
      //当前正在编辑的订单id
      orderRow: null
    }
  },
  created() {
    this.getOrderList()
  },

  methods: {
    //获取订单列表
    async getOrderList() {
      const {data: res} = await this.$http.post('http://localhost:8086/order/page', {
        page: this.queryInfo
      })
      if (!res.status) {
        return this.$message.error('获取订单列表失败！')
      }
      res.page.records.map((item, index) => {
        item.goodsList = [] //声明子数据
        item.keyId = index
        item.editAddr = false
        item.editDetailAddr = false
        return item
      })
      this.total = res.page.total
      this.orderList = res.page.records
    },
    //获取订单关联信息
    async getGoodsList(row) {
      console.log(row)
      const {data: res} = await this.$http.get(`http://localhost:8086/order/goods/${row.id}`)
      if (!res.status) {
        return this.$message.error(res.message)
      }
      // eslint-disable-next-line no-unused-vars
      this.$set(row, `goodsList`, res.data)
    },
    async getAreaData(node,resolved) {
      let parent=0
      if(node.level!==0){
        parent=node.data.id
      }
      const {data: res} = await this.$http.get('http://localhost:8082/addr/parent/'+parent)
      if (!res.status) {
        return this.$message.error(res.message)
      }
      const nodes=res.data.map(item=>({
        value:item.name,
        label:item.name,
        id:item.id,
        leaf:item.isLeaf
      }));
      resolved(nodes)
    },
    // 分页
    handleSizeChange(newSize) {
      this.queryInfo.size = newSize
      this.getOrderList()
    },
    handleCurrentChange(newSize) {
      this.queryInfo.current = newSize
      this.getOrderList()
    },
    showEditDialog(row) {
      if (this.cityData.size === 0) {
        this.getAreaData()
      }
      this.orderRow = row
      this.addressDialogVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressDialog() {
      // 供测试的物流单号：1106975712662
      const {data: res} = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败!')
      }
      this.progressInfo = res.data
      this.progressDialogVisible = true
    },
    handleColumnClick(row) {
      this.$refs.table.toggleRowExpansion(row, true)
    },
    async updateOrder() {
      let address=this.addressForm.address.reduce((pre,curr)=>{
        if (!pre)
          return curr
        return pre+"/"+curr;
      })
      let detailAddr= this.addressForm.detailAddr;
      // eslint-disable-next-line no-unused-vars
      const {data: res} = await this.$http.post(`http://localhost:8086/order/update`, {
        id: this.orderRow.id,
        address,
        detailAddr: detailAddr,
        userinfo: {}
      })
      if (!res.status) {
        return this.$message.error(res.message)
      }
      this.orderRow.address=address
      this.orderRow.detailAddr=detailAddr
      return this.$message.success(res.message)
    },
    async handleEditAddr() {
      this.$refs.addressFormRef.validate(v=>{
        if (v){
          this.addressDialogVisible = false
           this.updateOrder()
        }else{
          return this.$message.error("请按要求填写表单")
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}

.addr-info {
  display: flex;

  & > label {
    width: 300px;
    height: 30px;
    line-height: 30px;
  }

  & > .input-attr {
    height: 30px;
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
  }

}
</style>
