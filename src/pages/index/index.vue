<template>
	<view class="content">
		<!-- 状态栏占位 -->
		<view class="status_bar"></view>
		<view class="content_top">
			<view class="content_top_title">歌曲</view>
			<view class="content_top_button">
				<navigator url="" @click="allplay">
					<i class="iconfont icon-bofang1" ></i><view>全部播放</view>
				</navigator>
				<navigator url="/pages/search/index">
					<view><i class="iconfont icon-sousuo-"></i>搜索</view>
				</navigator>
			</view>
		</view>
		<view  class="content_bottom">
			<!-- 歌曲列表区域 -->
			<scroll-view scroll-y enable-back-to-top show-scrollbar="false" class="list_content_scroll">
				<uni-swipe-action>
					<uni-swipe-action-item :right-options="options" class="content_list" @click="deleteClick(item.id)" v-for="item in songList" :key="item.id">
						<view class="content_bottom_list" @click="playMiscu(item.id)">
							<view class="content_bottom_img"><image :src="item.img" ></image></view>
							<view :class="item.pitchOnClass===true?'content_bottom_view pitchOn':'content_bottom_view'">
								<view>{{item.songName}}</view>
								<view>{{item.name}}</view>
							</view>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
				<view class="noShow" v-if="songList.length===0">
					<view>暂无歌曲</view>
					<view>您可以通过搜索将歌曲添加到列表</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	// import {uniSwipeAction,uniSwipeActionItem } from '@dcloudio/uni-ui'
	export default {
		data() {
			return {	
				options:[
					{
						text: '移除',
						style: {
							backgroundColor: '#dd524d'
						}
					}
				],
				songList: []
			}
		},
		onLoad() {
			this.setData()
		},
		onShow() {
			this.setData()
		},
		methods: {
			// 刷新页面数据
			setData() {
				this.songList = uni.getStorageSync('musicList') || []
			},
			// 移除歌曲
			deleteClick(id) {
				let index = this.songList.findIndex(v => v.id === id);
				this.songList.splice(index,1)
				uni.setStorageSync('musicList',this.songList)
			},
			// 播放音乐
			playMiscu(id) {
				uni.navigateTo({
                 	url: '/pages/play/index?id=' + id
            	});
			},
			// 全部播放
			allplay() {
				uni.navigateTo({
                 	url: '/pages/play/index?id=' + this.songList[0].id
            	});
			}
		},
		components: {
			// uniSwipeAction,
			// uniSwipeActionItem
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
			border-bottom: 2rpx solid #e3e3e3;
			padding-bottom: 20rpx;
			.content_top_title {
				font-size: 60rpx;
				font-weight: 600;
				padding: 50rpx 0;
			}
			.content_top_button {
				display: flex;
				justify-content: space-between;
				navigator {
					display: flex;
					justify-content: center;
					width: 300rpx;
					border-radius: 10rpx;
					height: 90rpx;
					background-color: #f2f2f4;
					color: #e53f5b;
					line-height: 90rpx;
				}
				view {
					display: inline-block;
					font-size: 35rpx;
				}
				i {
						font-size: 50rpx;
						width: 50rpx;
						margin-right: 15rpx;
						vertical-align: middle;
					}
			}
		}
		.content_bottom {
			.list_content_scroll {
				// padding: 15rpx 0;
				height: calc(100vh - 350rpx);
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
						// flex: 4;
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
	.noShow {
		width: calc(100vw - 100rpx);
		transform: translateY(300%);
		view {
			&:nth-child(1) {
				font-size: 50rpx;
				font-weight: 600;
				text-align: center;
				padding-bottom: 20rpx;
			}
			&:nth-child(2) {
				text-align: center;
				font-size: 35rpx;
				color: #959595;
			}
		}
	}
</style>
	