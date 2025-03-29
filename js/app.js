const {createApp} = Vue

const app = createApp({
    data() {
        return {
            inputMsg: '',
            messages: [],
            currentCostume: 0,
            costumes: [
                "model/Tia/index1.json",
                "model/Tia/index2.json",
                "model/Tia/index3.json",
                "model/Tia/index4.json",
                "model/Tia/index5.json"
            ],
            qid: this.generateQID(),
            isSending: false,
            isChatVisible: true
        }
    },
    methods: {
        generateQID() {
            return 'qid-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
        },
        async sendMessage() {
            if (!this.inputMsg.trim() || this.isSending) return

            const userMessage = this.inputMsg
            this.inputMsg = ''
            this.messages.push(
                {type: 'user', content: userMessage},
                {type: 'bot', content: '', loading: true}
            )
            this.scrollToBottom()
            this.isSending = true

            try {
                const response = await fetch('https://deepseek.api.kihh.xyz/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: userMessage,
                        qid: this.qid
                    })
                })

                if (!response.ok) throw new Error('网络响应异常')

                const data = await response.json()
                this.messages.pop()
                this.messages.push({
                    type: 'bot',
                    content: data.content
                })
            } catch (error) {
                console.error(error)
                this.messages.pop()
                this.messages.push({
                    type: 'bot',
                    content: '好像出错了，请稍后再试...'
                })
            } finally {
                this.isSending = false
                this.scrollToBottom()
            }
        },
        // 修改后的changeCostume方法
        async changeCostume() {
            const prevModel = Live2DCore.getModel(); // 获取当前模型实例
            if (prevModel) {
                prevModel.destroy(); // 显式销毁旧模型
                await new Promise(resolve => setTimeout(resolve, 100)); // 等待资源释放
            }

            this.currentCostume = (this.currentCostume + 1) % this.costumes.length;
            try {
                await loadlive2d("live2d", this.costumes[this.currentCostume], {
                    lazyLoad: true, // 启用懒加载
                    autoUnload: true // 自动卸载非活跃模型
                });
                this.messages.push({
                    type: 'bot',
                    content: `☆ 第${this.currentCostume + 1}套服装加载完成！`
                });
            } catch (e) {
                console.error('模型加载失败:', e);
            }
            this.scrollToBottom();
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$el.querySelector('.messages')
                container.scrollTop = container.scrollHeight + 50
            })
        },
        toggleChat() {
            this.isChatVisible = !this.isChatVisible
        }
    },
    mounted() {
        loadlive2d("live2d", this.costumes[0])
        this.qid = this.generateQID()
        this.messages = [
            {type: 'bot', content: '☆ 欢迎回来，主人！'},
            {type: 'bot', content: '☆ 看板娘已接入Deepseek-R1'},
            {type: 'bot', content: '☆ 点击按钮可以换装哦～'}
        ]
        this.scrollToBottom()
    }
})

app.mount('#app')