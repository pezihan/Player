<template>
    <view class="contnent">
        <!-- 状态栏占位 -->
		<view class="status_bar"></view>
        <view class="background"><image  :src="thisPlay.img" /></view>
        <view class="content_top">
            <navigator open-type="navigateBack" class="content_top_back">
                <view class="iconfont icon-fanhui"></view>
            </navigator>
            <view class="content_top_title">
                <view>{{thisPlay.songName}}</view>
                <view>{{thisPlay.name}}</view>
            </view>
        </view>
        <!-- 中间光盘 -->
        <view class="content_cd">
            <view :class="paused===true?'content_cd_center':'content_cd_center stop'" id="cdRef">
                <image :src="thisPlay.img"></image>
            </view>
            <view :class="paused===true?'pulse1':'pulse1 stop'"></view>
            <view :class="paused===true?'pulse2':'pulse2 stop'"></view>
            <view :class="paused===true?'pulse3':'pulse3 stop'"></view>
        </view>
        <!-- 底部控制栏 -->
        <view class="content_bottom">
            <view class="content_bootom_bar">
                <view>{{currentTimeText}}</view>
                <view class="bottom_bar" id="playWidth">
                    <!-- 已缓存 -->
                    <view :style="'width:'+cacheMove" class="cache" id="cacheRef"></view> 
                    <!-- 拖动按钮 -->
                    <view @touchmove="mouseMove" @touchend="touchcancel" :style="'left:'+playmove" id="dragBtn" class="dragBtn"></view>
                    <!-- 已经播放 -->
                    <view :style="'width:'+playmove" class="finish" id="finishRef"></view>
                </view>
                <view>{{durationText}}</view>
            </view>
            <view class="content_bottom_btn">
                <view :class="listPatternClass[listPattern - 1]" @click="listPatternClick"></view>
                <view class="iconfont icon-shangyiqu101" @click="switchSong('top')"></view>
                <view :class="paused === true?'iconfont icon-zanting':'iconfont icon-bofang2'" @click="palyClick"></view>
                <view class="iconfont icon-xiayiqu101" @click="switchSong('bottom')"></view>
                <view @click="listShowClick" class="iconfont icon-bofangliebiao"></view>
            </view>
        </view>
        <!-- 列表栏 -->
        <view class="content_list" :style="'bottom:'+animationData" v-show="listShow">
            <view>播放列表</view>
            <scroll-view class="content_list_for" scroll-y>
                <view :class="item.pitchOnClass===true?'list_for pitchOn':'list_for'" v-for="item in musicList" :key="item.id" @click="playSongList(item.id)">
                    <view>{{item.songName}}</view>
                    <view> - {{item.name}}</view>
                </view>
            </scroll-view>
            <view @click="offList">关闭</view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            // 音乐列表
            musicList: [],
            // 当前播放的音乐
            thisPlay: {
                id: null,
                songName: '',
                name: '',
                img: '',
                url: ''
            },
            // 控制播放暂停
            paused: false,
            // 当前音频的总长度
            duration: 0,
            // 当前音频播放的位置
            currentTime: 0,
            // 当前音频已缓存位置
            buffered:0,
            // 定时器
            timer:null,
            // 存储拖动按钮默认距离left的距离
            thiLeft:0,
            // 存储进度条的width宽
            theWidth: 0,
            // 播放列表显示与移动
            listShow:false,
            animationData: '-60vh',
            // 列表播放模式  1 列表循环 2 列表顺序播放  3 单曲循环
            listPattern: 1,
            // 列表图标样式
            listPatternClass: ['iconfont icon-icon-','iconfont icon-suijibofang01','iconfont icon-hanhan-01-01']
        }
    },
    onLoad(option) {
        if(option.id != this.thisPlay.id) {
            this.playMusic(option.id) 
        }
    },
    onShow() {
        this.listPattern = uni.getStorageSync('listPattern')===''? 1 : uni.getStorageSync('listPattern')
    },
    mounted() {
        const query = uni.createSelectorQuery().select('#dragBtn');
        const wdith = uni.createSelectorQuery().select('#playWidth');        
        query.fields({rect:true},data => {
            this.thiLeft = data.left
        }).exec()
        wdith.fields({size:true},data => {
            this.theWidth = data.width
        }).exec()
    },
    methods: {
        // 播放音乐
        async playMusic(id) {
            this.musicList = uni.getStorageSync('musicList') || []
            uni.setStorageSync('playId',id)
            this.musicList.forEach((item) => {
                if(item.id == id) {
                    this.thisPlay.id = item.id
                    this.thisPlay.songName = item.songName
                    this.thisPlay.name = item.name
                    this.thisPlay.img = item.img
                    item.pitchOnClass = true
                } else {
                    item.pitchOnClass = false
                }
            })
            uni.setStorageSync('musicList',this.musicList)
            const {data:resData} = await this.request({url: '/song/url',data: {id:id},method: 'get'})
            this.thisPlay.url = resData[0].url
            // 播放音乐
            const aduio = uni.getBackgroundAudioManager()
            aduio.src = this.thisPlay.url
            aduio.title = this.thisPlay.songName
            this.palyClick(false)
            // 音频自然播放结束
            aduio.onEnded(() => {
                this.switchSong('next')
            })
        },
        // 切换音频
        switchSong(text) {
            var index = this.musicList.findIndex(v => v.id===this.thisPlay.id);
            if(this.listPattern === 1) {
                // 列表循环  默认
                if(text === 'top') {
                    // 上一曲
                    if(index == parseInt(0)) {
                        this.playMusic(this.musicList[this.musicList.length - 1].id)
                        return
                    }
                    this.playMusic(this.musicList[index - 1].id)
                } else {
                    // 下一曲
                    if(this.musicList.length === index+1) {
                        this.playMusic(this.musicList[0].id)
                        return
                    }
                    this.playMusic(this.musicList[index + 1].id)
                }
            } else if(this.listPattern === 2) {
                // 随机播放
                const suijiIndex = this.randomNum(0,this.musicList.length - 1)
                this.playMusic(this.musicList[suijiIndex].id)
            } else {
                // 单曲循环
                if(text === 'next') {
                    this.playMusic(this.musicList[index].id)
                } else  if(text === 'top') {
                    // 上一曲
                    if(index == parseInt(0)) {
                        this.playMusic(this.musicList[this.musicList.length - 1].id)
                        return
                    }
                    this.playMusic(this.musicList[index - 1].id)
                } else {
                    // 下一曲
                    if(this.musicList.length === index+1) {
                        this.playMusic(this.musicList[0].id)
                        return
                    }
                    this.playMusic(this.musicList[index + 1].id)
                }
            }
        },
        // 随机数生成
        randomNum(minNum,maxNum){ 
			    switch(arguments.length){ 
			        case 1: 
			            return parseInt(Math.random()*minNum+1,10); 
			        break; 
			        case 2: 
			            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
			        break; 
			            default: 
			                return 0; 
			            break; 
			    } 
		},
        // 音频播放暂停定时器
        palyClick(val) {
            const aduio = uni.getBackgroundAudioManager()
            if(this.paused === false || val === false) {
                aduio.play()
                clearInterval(this.timer)
                this.timer = setInterval(() => {
                    this.currentTime = aduio.currentTime
                    this.duration = aduio.duration
                    this.buffered = aduio.buffered
                },1000)
                this.paused = true
            } else {
                aduio.pause()
                clearInterval(this.timer)
                this.paused = false
            }
        },
        // 拖动进度条事件
        mouseMove(event) {
            clearInterval(this.timer)
            const move = event.changedTouches[0].clientX - this.thiLeft
            if(move <= this.theWidth && move >= 0) {
                this.currentTime = this.duration * (move / this.theWidth)
            }
        },
        // 松开进度条白点启动快进
        touchcancel() {
            const aduio = uni.getBackgroundAudioManager()
            aduio.seek(this.currentTime)
            this.palyClick(false)
        },
        // 播放列表音乐
        playSongList(id) {
            console.log(id);
            this.playMusic(id)
        },
        // 显示播放列表
        listShowClick() {
            this.listShow = true
            setTimeout(() => {
                this.animationData = '50rpx'
            },50)
        },
        // 关闭播放列表
        offList() {
            this.animationData = '-60vh'
            setTimeout(()=>{
                this.listShow = false
            },200)
        },
        // 播放模式切换
        listPatternClick() {
            if (this.listPattern === 1) {
                this.listPattern = 2
                uni.setStorageSync('listPattern', 2)
            } else if(this.listPattern === 2) {
                this.listPattern = 3
                uni.setStorageSync('listPattern', 3)
            } else {
                this.listPattern = 1
                uni.setStorageSync('listPattern', 1)
            }
        }
    },
    computed: {
        durationText () {
            let hour = parseInt(parseInt(this.duration) / 3600)
            let minute = parseInt(parseInt(this.duration) / 60)
            let second = parseInt(this.duration) % 60
            if (hour.toString().length === 1) {
                hour = '0' + String(hour)
            }
            if (minute.toString().length === 1) {
                minute = '0' + String(minute)
            }
            if (second.toString().length === 1) {
                second = '0' + String(second)
            }
            const text = hour + ':' + minute + ':' + second
            return text
        },
        currentTimeText () {
            let hour = parseInt(parseInt(this.currentTime) / 3600)
            let minute = parseInt(parseInt(this.currentTime) / 60)
            let second = parseInt(this.currentTime) % 60
            if (hour.toString().length === 1) {
                hour = '0' + String(hour)
            }
            if (minute.toString().length === 1) {
                minute = '0' + String(minute)
            }
            if (second.toString().length === 1) {
                second = '0' + String(second)
            }
            const text = hour + ':' + minute + ':' + second
            return text
        },
        // 已经播放的位置计算
        playmove() {
            return (this.currentTime / this.duration) * 100 + '%'
        },
        // 已经缓存的位置计算
        cacheMove() {
            return (this.buffered / this.duration) * 100 + '%'
        }
    }
}
</script>

<style lang="scss" scoped>
    // 选中
    .pitchOn {
        view {
            color: #e75866!important;
        }
    }
    .status_bar {
		height: var(--status-bar-height);
		width: 100%;
	}
    .contnent {
        padding: 0 20rpx;
        color: #fff;
        .background {
            width: 100vw;
            height: 100vh;
            position: absolute;
            top: 0;
            left: 0;
            z-index: -1;
            overflow: hidden;
            image {
                width: 100%;
                height: 100%;
                filter: blur(15px);
                transform: scale(1.2);
            }
        }
        .content_top {
            display: flex;
            align-items: center;
            position: relative;
            height: 160rpx;
            .content_top_back {
                // margin-top: 20rpx;
                .iconfont {
                    font-size: 55rpx;
                }
            }
            .content_top_title {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                view {
                    overflow:hidden;
                    white-space:nowrap;
                    text-overflow:ellipsis;
                    width:calc(100vw - 300rpx);
                    text-align: center;
                    vertical-align: middle;
                    &:nth-child(1) {
                        font-size: 30rpx;
                    }
                    &:nth-child(2) {
                        font-size: 24rpx;
                        color: #d1d1d1;
                    }
                }
            }
        }
    }
    .content_cd {
        position: absolute;
        left: 50%;
        top: 28%;
        transform: translateX(-50%);
        .content_cd_center {
            width: 500rpx;
            height: 500rpx;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, .2);
            position: relative;
            z-index: 4;
            animation: move 5s linear infinite;
            image {
                position: absolute;
                width: 95%;
                height: 95%;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%);
            }
        }
        .pulse1,.pulse2,.pulse3 {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            width: 500rpx;
            height: 500rpx;
            border-radius: 50%;
            box-shadow: 0 0 12px #d4d4d4;
            animation: pulse 3s linear infinite;
            z-index: 2;
        }
        // 其余两个环延时动画
        .pulse2 {
            animation-delay: 0.5s;
        }
        .pulse3 {
            animation-delay: 1s;
        }
        .stop {
            animation-play-state: paused;
        }
        @keyframes move {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        @keyframes pulse {
                0% {}
                70% {
                    width: 450rpx;
                    height: 450rpx;
                    opacity: 1;
                }
                100% {
                    width: 750rpx;
                    height: 750rpx;
                    opacity: 0;
                }
        }
    }
    // 按钮部分
    .content_bottom {
        height: 140rpx;
        width: calc(100vw - 40rpx);
        position: absolute;
        bottom: 140rpx;
        .content_bootom_bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 50rpx;
            view {
                &:nth-child(1) {
                    font-size: 22rpx;
                }
                &:nth-child(3) {
                    font-size: 22rpx;
                }
            }
            .bottom_bar {
                height: 6rpx;
                width: calc(100vw - 260rpx);
                background-color: #444444;
                position: relative;
                .cache {
                    background-color: #5f5f5f;
                    height: 6rpx;
                    position: absolute;
                    left: 0;
                    width: 0;
                }
                .dragBtn {
                    width: 20rpx;
                    height: 20rpx;
                    border-radius: 50%;
                    background-color: #fff;
                    position: absolute;
                    top: -120%;
                    left: 0;
                }
                .finish {
                    background-color: #a0a0a0;
                    height: 6rpx;
                    position: absolute;
                    width: 0;
                }
            }
        }
        .content_bottom_btn {
            display: flex;
            width: calc(100vw - 40rpx);
            justify-content: space-around;
            align-items: center;
            .iconfont {
                font-weight: 100;
                font-size:50rpx;
            }
            view {
                &:nth-child(3) {
                    padding: 0;
                    font-size: 100rpx;
                }
            }
        }
    }
    // 播放列表
    .content_list {
        position: absolute;
        bottom: 50rpx;
        width: calc(100vw - 40rpx);
        height: 60vh;
        background-color: #fff;
        border-radius: 40rpx;
        color: #000;
        padding: 20rpx;
        overflow: hidden;
        transition: .3s;
        .content_list_for {
            height: calc(60vh - 220rpx);
            .list_for {
                height: 100rpx;
                border-bottom: 2rpx solid #e6e6e6;
                line-height: 100rpx;
                font-size: 35rpx;
                text-overflow: ellipsis; 
                overflow: hidden; 
                white-space: nowrap; 
                view {
                    display: inline;
                    &:nth-child(2) {
                        font-size: 28rpx;
                        color: #5e5e5e;
                    }
                }
            }
        }
        >view {
            &:nth-of-type(1) {
                font-weight: 600;
                font-size: 45rpx;
                line-height: 80rpx;
                height: 80rpx;
            }
            &:nth-child(3) {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 120rpx;
                width: 100%;
                text-align: center;
                line-height: 120rpx;
                border-top: 2rpx solid #e6e6e6;
                font-size: 34rpx;
                background-color: #fff;
            }
        }
    }
</style>