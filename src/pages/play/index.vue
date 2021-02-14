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
                <view class="iconfont icon-icon-"></view>
                <view class="iconfont icon-shangyiqu101"></view>
                <view :class="paused === true?'iconfont icon-zanting':'iconfont icon-bofang'" @click="palyClick"></view>
                <view class="iconfont icon-xiayiqu101"></view>
                <view @click="listShowClick" class="iconfont icon-bofangliebiao"></view>
            </view>
        </view>
        <!-- 列表栏 -->
        <view class="content_list" :style="'bottom:'+animationData" v-show="listShow">
            <view>播放列表</view>
            <scroll-view class="content_list_for" scroll-y>
                <view class="list_for" v-for="item in songList" :key="item.id" @click="playSongList(item.id)">
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
            // 播放列表
            songList:[],
            // 播放列表显示与移动
            listShow:false,
            animationData: '-60vh'
        }
    },
    onLoad(option) {
        this.playMusic(option.id)
        this.songList = uni.getStorageSync('musicList') || []
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
            this.musicList.forEach((item) => {
                if(item.id == id) {
                    this.thisPlay.id = item.id
                    this.thisPlay.songName = item.songName
                    this.thisPlay.name = item.name
                    this.thisPlay.img = item.img
                }
            })
            const {data:resData} = await this.request({url: '/song/url',data: {id:id},method: 'get'})
            this.thisPlay.url = resData[0].url
            // 播放音乐
            const aduio = uni.getBackgroundAudioManager()
            aduio.src = this.thisPlay.url
            aduio.title = this.thisPlay.songName
            this.palyClick(false)
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
        border-radius: 30rpx;
        color: #000;
        padding: 20rpx;
        overflow: hidden;
        transition: .2s;
        // bottom: -60vh;
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