<template>
    <view class="content">
        <!-- 状态栏占位 -->
		<view class="status_bar"></view>
        <view class="content_top">
            <view class="iconfont icon-fanhui" @click="back">返回</view>
            <view class="title">搜索</view>
        </view>
        <view class="content_input">
            <view class="iconfont icon-sousuo-"></view>
            <input class="text" v-model="songGet.keywords" placeholder="艺人、歌曲、歌词以及更多内容"  @confirm="handleEnterClick"/>
        </view>
        <!-- 搜索推荐区 -->
        <view class="content_hash" v-show="recommendShow">
            <view class="contene_hash_top" v-if="recently.length>0">
                <view class="hash_tilte">
                    <view>最近搜索</view>
                    <view @click="deletelist">清除</view>
                </view>
                <view class="hash_content" @click="textClick(item)" v-for="(item, index) in recently" :key="index">{{item}}</view>
            </view>
            <view class="content_hash_bottom">
                <view class="bottom_tilte">热门搜索</view>
                <view @click="textClick(item)" v-for="(item,index) in recommend" :key="index">{{item}}</view>
            </view>
        </view>
        <!-- 搜索显示区 -->
        <view class="content_songs" v-show="songsListShow">
            <scroll-view scroll-y enable-back-to-top class="list_content_scroll" @scrolltolower="scrolltolowerDatd">
                <view class="content_bottom_list" v-for="item in songList" :key="item.id" @click="playMusic(item)">
					<view class="content_bottom_img"><image :src="item.img" ></image></view>
					<view :class="item.pitchOnClass===true?'content_bottom_view pitchOn':'content_bottom_view'">
						<view>{{item.songName}}</view>
						<view>{{item.name}}</view>
					</view>
				</view>
            </scroll-view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            // 最近搜索
            recently: [],
            // 推荐搜索
            recommend: [],
            // 提交歌曲信息
            songGet: {
                keywords: '',
                limit: 15,
                offset: 0
            },
            // 控制推荐面板是否隐藏
            recommendShow: true,
            // 控制搜索列表显示
            songsListShow: false,
            // 音乐搜索列表
            songList:[],
            // 当前播放id
            playId: null
        }
    },
    onShow() {
        this.recently = uni.getStorageSync('recently') || []
        this.playId = uni.getStorageSync('playId')
        this.songList.forEach((item) => {
            if(item.id == this.playId) {
                item.pitchOnClass = true
            } else {
                 item.pitchOnClass = false
            }
        })
    },
    onLoad() {
        this.getHot()
    },
    methods: {
        // 返回
        back() {
            uni.navigateBack({
                 delta: 1
            });
        },
        // 删除历史搜索
        deletelist () {
            this.recently = []
            uni.setStorageSync('recently',[])
        },
        // 获取热搜
        async getHot() {
            const res = await this.request({url:'/search/hot',method:'get'})
            const recommend = res.result.hots
            this.recommend = []
            for(let i = 0; i < 3;i++) {
                this.recommend.push(recommend[i].first)
            }
        },
        // 发送请求
        async getData() {
            this.playId = uni.getStorageSync('playId')
            const res = await this.request({url:'/search',data: this.songGet,method:'get'})
            let list = []
            res.result.songs.forEach((item) => {
                if(item.id == this.playId) {
                    list.push({
                    id: item.id,
                    songName: item.name,
                    name: item.album.name,
                    img: item.album.artist.img1v1Url,
                    pitchOnClass: true
                    })
                } else {
                    list.push({
                    id: item.id,
                    songName: item.name,
                    name: item.album.name,
                    img: item.album.artist.img1v1Url,
                    pitchOnClass: false
                    })
                }
            })
            this.songList = [...this.songList,...list]
            this.recommendShow = false
            this.songsListShow = true

            let isCollect = this.recently.some(v=>v===this.songGet.keywords);
            if (isCollect === true) {
                return
            }
            this.recently.splice(2,1)
            this.recently.unshift(this.songGet.keywords)
            uni.setStorageSync('recently',this.recently)
        },
        // 按下回车
        handleEnterClick() {
            if(this.songGet.keywords === '') {
                this.recommendShow = true
                this.songsListShow = false
                return
            }
            this.songGet.offset = 0
            this.songList = []
            this.getData()
        },
        // 点击推荐搜索
        textClick(text) {
            this.songGet.keywords = text
            this.songGet.offset = 0
            this.songList = []
            this.getData()
        },
        // 博放音乐
        playMusic(item) {
            let musicList = uni.getStorageSync('musicList') || []
            let isCollect = musicList.some(v => v.id === item.id)
            if(isCollect === false) {
                musicList.unshift(item)
                uni.setStorageSync('musicList',musicList)
            }
            // 播放
            uni.navigateTo({
                 url: '/pages/play/index?id=' + item.id
            });
        },
        // 滚动触底加载事件
        scrolltolowerDatd() {
            this.songGet.offset++
            this.getData()
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
    .content {
        padding: 0 50rpx;
        .content_top {
            margin-top: 20rpx;
            height: 130rpx;
            .iconfont {
                font-size: 34rpx;
                display: inline-block;
                line-height: 130rpx;
                color: #e53f5b;
            }
            .title {
                font-size: 50rpx;
                display: inline-block;
                position: absolute;
                margin-top: 30rpx;
                left: 50%;
                transform: translateX(-50%);
                font-weight: 600;
            }
        }
        .content_input {
            width: calc(100vw - 100rpx);
            height: 70rpx;
            border-radius: 10rpx;
            background-color: #efeff1;
            display: flex;
            align-items: center;
            .iconfont {
                font-size: 40rpx;
                padding: 0 10rpx;
                color: #7c7c7e;
            }
            .text {
                width: 100%;
                padding: 0 10rpx;
                color: #7c7c7e;
            }
        }
        .content_hash {
            margin-top: 20rpx;
            .contene_hash_top {
                .hash_tilte {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    font-size: 34rpx;
                    padding: 10rpx 0;
                    border-bottom: 1rpx solid #e5e5e5;
                    font-weight: 600;
                    view {
                        &:nth-child(2) {
                            color: #e53f5b;
                            font-size: 30rpx;
                            vertical-align: bottom;
                            font-weight: 500;
                        }
                    }
                }
                .hash_content {
                    color: #e53f5b;
                    font-size: 34rpx;
                    padding: 20rpx 0;
                    border-bottom: 1rpx solid #e5e5e5;
                    &:last-child{
                        border-bottom: none;
                    }
                }
            }
            .content_hash_bottom {
                margin-top: 20rpx;
                .bottom_tilte {
                        font-size: 34rpx;
                        padding: 10rpx 0;
                        border-bottom: 1rpx solid #e5e5e5;
                        font-weight: 600;
                        color: black;
                }
                view {
                    color: #e53f5b;
                        font-size: 34rpx;
                        padding: 20rpx 0;
                        border-bottom: 1rpx solid #e5e5e5;
                    &:last-child {
                        border-bottom: none;
                    }
                }
            }
        }
        .content_songs {
            margin-top: 20rpx;
			.list_content_scroll {
				// padding: 15rpx 0;
				height: calc(100vh - 240rpx);
                ::-webkit-scrollbar{
                    display: none;
                }
				.content_bottom_list {
					display: flex;
					justify-content: space-between;
					align-items: center;
					height: 120rpx;
					.content_bottom_img {
						width: 100rpx;
						height: 100rpx;
						border-radius: 10rpx;
						overflow: hidden;
						margin-right: 30rpx;
						image {
							width: 100%;
							height: 100%;
						}
					}
					.content_bottom_view {
						flex: 4;
						height: 120rpx;
						border-bottom: 1rpx solid #e5e5e5;
						width: 100vw;
						view {
                            overflow:hidden;
                            white-space:nowrap;
                            text-overflow:ellipsis;
                            width:calc(100vw - 300rpx);
							&:nth-of-type(1) {
								margin-top: 15rpx;
								color: #191919;
								font-size: 34rpx;
							}
							&:nth-of-type(2) {
								color: #808080;
								font-size: 24rpx;
								padding: 6rpx 0;
							}
						}
					}
				}
			}
		}
    }
</style>