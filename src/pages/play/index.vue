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
        <view></view>
        <!-- 底部控制栏 -->
        <view>
            
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
            }
        }
    },
    onLoad(option) {
        this.musicList = uni.getStorageSync('musicList') || []
        this.musicList.forEach((item) => {
            if(item.id == option.id) {
                this.thisPlay.id = item.id
                this.thisPlay.songName = item.songName
                this.thisPlay.name = item.name
                this.thisPlay.img = item.img
            }
        })
        console.log(option)
        this.playMusic(option.id)
    },
    methods: {
        // 播放音乐
        async playMusic(id) {
            const {data:resData} = await this.request({url: '/song/url',data: {id:id},method: 'get'})
            this.thisPlay.url = resData[0].url
            // 播放音乐
            const aduio = uni.getBackgroundAudioManager()
            aduio.src = this.thisPlay.url
            aduio.title = this.thisPlay.songName
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
</style>