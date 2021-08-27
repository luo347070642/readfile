<template>
  <div class="immune-cell-protocol">
    <scroll class="scroll-total-wrap">
      <div class="contract-box">
        <div class="every-contract-box h-view align-start" v-for='(item, index) in contract' :key='index'>
          <p class='flex-shrink'>{{item.name}}：</p>
          <p class='content' v-show='item.name === "合同编号" || item.name === "存储产品"'>{{item.content}}</p>
          <p class='content total-money' v-show='item.name === "合同金额"'>¥{{item.content}}</p>
          <p class='content' v-show='item.name === "存储管数"'>{{item.content}}管</p>
          <p class='content' v-show='item.name === "存储年限"'>{{item.content == 99 ? '终生' : item.content + '年'}}</p>
        </div>
      </div>
      <div class="contract-box">
        <div class="title">甲方信息<span class="hide-toast" v-show="!isHide">(待签约时补充)</span></div>
        <div class="every-contract-box h-view align-start" v-for='(item, index) in firstParty' :key='index'>
          <p class='flex-shrink'>{{item.name}}：</p>
          <p class='content' :class='{"total-money": item.name === "合同金额"}'>{{item.content}}</p>
        </div>
      </div>
      <div class="contract-box" v-show='hasContent'>
        <div class="title">法定代理人</div>
        <div class="every-contract-box h-view align-start" v-for='(item, index) in legalRepresentative' :key='index' v-show='item.content'>
          <p class='flex-shrink'>{{item.name}}：</p>
          <p class='content'>{{item.content}}</p>
        </div>
      </div>
      <div class="contract-box">
        <div class="title">乙方信息</div>
        <div class="every-contract-box h-view align-start" v-for='(item, index) in partyB' :key='index'>
          <p class='flex-shrink'>{{item.name}}：</p>
          <p class='content' :class='{"total-money": item.name === "合同金额"}'>{{item.content}}</p>
        </div>
      </div>
      <div class="protocol-details">
        <div class="total-title">协议明细</div>
        {{ fileContent }}
      </div>
    </scroll>
  </div>
</template>

<script>
import scroll from '@/base/scroll/scroll'
import { getSignInfo } from '@/api/sns'
export default {
  name: 'immuneCellProtocol',
  components: {
    scroll
  },
  data () {
    return {
      contract: [
        {
          name: '合同编号',
          content: ''
        },
        {
          name: '存储产品',
          content: ''
        },
        {
          name: '存储管数',
          content: ''
        },
        // {
        //   name: '存储年限',
        //   content: ''
        // },
        {
          name: '合同金额',
          content: ''
        }
      ],
      firstParty: [
        {
          name: '姓名',
          content: ''
        },
        {
          name: '身份证号',
          content: ''
        },
        {
          name: '手机号码',
          content: ''
        },
        {
          name: '通讯地址',
          content: ''
        }
      ],
      legalRepresentative: [
        {
          name: '姓名',
          content: ''
        },
        {
          name: '身份证号',
          content: ''
        },
        {
          name: '手机号码',
          content: ''
        }
      ],
      partyB: [
        {
          name: '公司名称',
          content: '青岛海尔生物科技有限公司'
        },
        {
          name: '法定代表人',
          content: '王飞'
        },
        {
          name: '联系地址',
          content: '山东省青岛市城阳区城阳街道靖城路1066-2号'
        }
        // {
        //   name: '邮政编码',
        //   content: '266000'
        // },
        // {
        //   name: '咨询电话',
        //   content: '400-800-1067 / 0532-55726086'
        // }
      ],
      year: '10',
      money: 17900,
      amountInWords: [],
      serviceCharge: '',
      hasContent: true,
      isHide: true
    }
  },
  created () {
    if (this.$route.query.reserveId && this.$route.query.reserveId !== '') {
      this.init()
    } else {
      this.contract = [
        {
          name: '存储产品',
          content: this.$route.query.productName
        },
        {
          name: '存储管数',
          content: this.$route.query.pipeNum
        },
        {
          name: '合同金额',
          content: this.$route.query.contractNum
        }
      ]
      this.isHide = false
      this.hasContent = false
      this.money = this.$route.query.contractNum
      this.amountInWords = this.$options.filters['changeNumMoneyToChinese'](this.money)
    }
  },
  methods: {
    init () {
      let params = {
        reserveId: this.$route.query.reserveId
      }
      this.$$loading()
      getSignInfo(params).then((data) => {
        this.$$loadingClear()
        this.$set(this.firstParty[0], 'content', data.name)
        this.$set(this.firstParty[1], 'content', data.idCard)
        this.$set(this.firstParty[2], 'content', data.phone)
        this.$set(this.firstParty[3], 'content', data.address)
        this.$set(this.contract[0], 'content', data.contractCode)
        this.$set(this.contract[1], 'content', data.productName.split('-')[0])
        this.$set(this.contract[2], 'content', data.productTubeCount)
        // this.$set(this.contract[3], 'content', data.productYear)
        this.$set(this.contract[3], 'content', data.contractAmt)
        // this.$set(this.contract[4], 'content', data.agentName)
        this.$set(this.legalRepresentative[0], 'content', data.agentName)
        this.$set(this.legalRepresentative[1], 'content', data.agentIdCard)
        this.$set(this.legalRepresentative[2], 'content', data.agentPhone)
        if (!data.agentIdCard && !data.agentAddress && !data.agentPhone) {
          this.hasContent = false
        }
        this.year = data.productYear === '99' ? '终生' : data.productYear
        this.money = data.contractAmt
        this.cellType = data.productName
        this.serviceCharge = data.examAmt
        this.amountInWords = this.$options.filters['changeNumMoneyToChinese'](this.money)
      }, () => {
        this.$$loadingClear()
      })
    }
  }
}
</script>

<style scoped>

</style>
