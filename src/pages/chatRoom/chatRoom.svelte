<script lang="ts">
    import type { ActionsUpdate, BotComment, Comment, Reply } from "../../../types/comment.type"
    import type { User, UserExtended } from "../../../types/user.type";
    import type { Moderation, RoomData, Notification } from "../../../types/room.type";
    import { navigate } from 'svelte-routing';
    // import { Users } from "../../../server/util/users";
    import CommentComponent from "../../components/comment.svelte"
    import SendCommentComponent from "../../components/sendCommentComponent.svelte"
    import { onMount } from "svelte";
    import  store from "../../stores/store";
    // import {allComments} from "../../../server/server";
    // import {Logs} from "../../../server/util/logs";
    import * as animateScroll from "svelte-scrollto";
    import IntersectionObserver from "svelte-intersection-observer";

    let element;
    let remainingTimeCounter
    let remainingTime = 0
    let historyComments: Array<Comment> = [];
    let user: UserExtended;

    let comments: Array<Comment> = [];
    let replies = {};
    let notifications: Notification[] = [];
    let n_new_comments = 0;

    const addNotification = (notification: Notification) => {
        notifications = [... notifications, notification]
    }
    const removeNotification = (index: number) => {
        notifications = [
            ...notifications.slice(0, index),
            ...notifications.slice(index + 1, notifications.length)
        ]
    }
    const addReply = (newReply: Reply) => {
        if(replies[newReply.parentID])
            replies[newReply.parentID] = [... replies[newReply.parentID], newReply.comment]
        else
            replies[newReply.parentID] = [newReply.comment]

        // if(newReply.comment.user.id === user.user.id)
        //     animateScroll.scrollTo({element: `.commentCard.id${newReply.comment.id}`})
    }

    const generateComment = (autoComment: BotComment) => {
        console.log(`received bot Comment: ${JSON.stringify(autoComment, null, 4)}`)
        const newComment: Comment = {
            id: autoComment.id,
            time: new Date(autoComment.time),
            user: {
                mTurkId: "",
                id: autoComment.botName,
                name: autoComment.botName
            },
            content: autoComment.content,
            moderation: autoComment.moderation
        }
        console.log(`generated new comment: ${JSON.stringify(newComment, null, 4)}`)
        return newComment
    }

    const addComment = (newComment: Comment) => {
        // console.log("####Comments before adding",comments)
        comments = [... comments, newComment]
        // console.log("####Comments after adding",comments)
        if(newComment.user.id === user.user.id) {
            // console.log("###Animation since it's my comment")
            animateScroll.scrollToBottom()
        }
        else{
            n_new_comments++
        }
    }
    const flagComment = (commentID: number) => {
        const comment = comments.find((comment: Comment) => comment.id === commentID)
        const index = comments.findIndex((comment: Comment) => comment.id === commentID)
        const newComment = comment
        newComment.flagged = true
        console.log("Flagged moderation: " + console.log(JSON.stringify(newComment, null, 4)));
        comments = [
            ...comments.slice(0, index),
            newComment,
            ...comments.slice(index + 1, comments.length)
        ]
    }

    const removeComment = (commentID: number) => {
        const comment = comments.find((comment: Comment) => comment.id === commentID)
        const index = comments.findIndex((comment: Comment) => comment.id === commentID)
        const newComment = comment;
        newComment.content = comment.moderation.textComment;
        newComment.removed = true;
        console.log("Removed moderation: " + console.log(JSON.stringify(newComment, null, 4)));
        comments = [
            ...comments.slice(0, index),
            newComment,
            ...comments.slice(index + 1, comments.length-1)
        ]
    }
    const removeCommentsOfUser = (comms: Comment[], userID: string) => {
        let index = comms.findIndex((comment: Comment) => comment.user.id === userID)
        while( -1 < index) {
            comms.splice(index,1)
            index = comms.findIndex((comment: Comment) => comment.user.id === userID)
        }
        return comms
    }

    const removeEveryCommentFromUser = (userID: string) => {
        comments = removeCommentsOfUser(comments, userID)
        for (const key in replies) {
            replies[key] = removeCommentsOfUser(replies[key], userID)
        }
    }

    const autoSend = (time: Date, callback, ...args) => {
        const timetarget = time.getTime();
        const timenow =  new Date().getTime();
        const offsetmilliseconds = timetarget - timenow;


        if (offsetmilliseconds > 0) setTimeout(() => callback.apply(this, args), offsetmilliseconds)
        else callback.apply(this, args)
    }
    const closeChatRoom = () => {
        navigate(`checkout`, { replace: false });
        clearInterval(remainingTimeCounter)
        console.log("Experiment ends")
    }

    const closeChatRoomRefresh = () => {
        navigate(`checkoutOnRefresh`, { replace: false });
        clearInterval(remainingTimeCounter)
        console.log("Experiment ends")
    }

    onMount(() => {
        store.userStore.subscribe((currentUser: UserExtended) => {
            if(currentUser) user = currentUser
        })

        store.roomStore.subscribe((assignedRoom: RoomData) => {
            comments = []
            console.log("incommingRoom", assignedRoom)
            if(assignedRoom?.userModerationEvents) {
                assignedRoom.userModerationEvents.map((moderation: Moderation) => {

                    autoSend(new Date(moderation.time), addNotification, moderation)
                    // if User got removed, remove every comment of that user from the comments list
                    if(moderation?.type === 0)
                        autoSend(new Date(moderation.time), removeEveryCommentFromUser, moderation.target)
                })
            }


            // calculate end Time from start time and duration given in minutes
            const endTime = new Date(new Date(assignedRoom?.startTime).getTime() + assignedRoom?.duration * 60 * 1000)
            console.log("assigned room is")
            console.log(assignedRoom)
            if (typeof assignedRoom !== 'undefined'){
                autoSend(endTime, closeChatRoom)
            }
            else{
                console.log("Its undefined")
                autoSend(endTime,closeChatRoomRefresh)
            }

            remainingTimeCounter = setInterval(() => {
                const now = Date.now()
                const remainingTimeMS = endTime - now
                remainingTime = remainingTimeMS / 1000
            }, 1000);

            if(assignedRoom?.automaticComments) {
                const comms = assignedRoom?.automaticComments.sort((a: BotComment, b: BotComment) => a.time > b.time ? 1 : -1)
                console.log("automaticComments", comms)
                comms.map((autoComment: BotComment) => {

                    const newComment = generateComment(autoComment)
                    autoSend(newComment.time, addComment, newComment)

                    // register top level comment moderation messages
                    if(autoComment?.moderation) {
                        const moderationEvent = autoComment.moderation
                        autoSend(new Date(moderationEvent.time), addNotification, moderationEvent)
                        if(moderationEvent?.type === 1)
                            autoSend(new Date(moderationEvent.time), flagComment, moderationEvent.target)
                        // If comment got removed, mark it's content as removed
                        if(moderationEvent?.type === 2)
                            autoSend(new Date(moderationEvent.time), removeComment, moderationEvent.target)
                    }

                    if(autoComment.replies) {
                        for(let reply of autoComment.replies) {
                            const newReply = {
                                parentID: autoComment.id,
                                comment: generateComment(reply)
                            }
                            autoSend(newReply.comment.time, addReply, newReply)

                            // register reply level comment moderation messages
                            if(reply?.moderation) {
                                const moderationEvent = autoComment.moderation
                                autoSend(new Date(moderationEvent.time), addNotification, moderationEvent)
                            }
                        }
                    }
                    
                })
            }
        })

        store.replyStore.subscribe((currentReply: Reply) => {
            if(currentReply) {
                addReply(currentReply)
            }
        })
        store.actionsStore.subscribe((actionsUpdate: ActionsUpdate) => {
            if(actionsUpdate) {
                
            }
        })

        store.commentStore.subscribe((currentComment: Comment) => {
            if(currentComment) addComment(currentComment)
        })

        store.commentsStore.subscribe((allPrevComments:Comment[]) =>{
            if(allPrevComments){
                for(const tempComment of allPrevComments){
                    addComment(tempComment)
                }
            }
        })

        store.repliesStore.subscribe((allReplies: Reply[]) => {
            if(allReplies) {
                for(const currentReply of allReplies){
                    addReply(currentReply)
                }
            }
        })

        store.allActionsStore.subscribe((allActionsUpdate: ActionsUpdate[]) => {
            if(allActionsUpdate) {
                for(const actionsUpdate of allActionsUpdate) {
                    
                }
            }
        })

    })
    let y;

    function secondsToDhms(seconds) {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600*24));
        const h = Math.floor(seconds % (3600*24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);

        const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";

        const res = (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "");
        return res
    }



    $: remainingTimeFormatted = secondsToDhms(remainingTime)
</script>

<svelte:window bind:scrollY={y}/>

<svelte:head>
    <title>Discussion Room</title>
</svelte:head>
<div class="remaining-time-container">
    <div class="remaining-time">
        <p>Remaining time: </p>
        <p>{remainingTimeFormatted}</p>
    </div>
</div>
<div class="container">

    <div class="center">
        <div class="notificationArea">
            {#each notifications as notification, i}
                {#if notifications.length - 4 < i}
                    <div class="notification" on:click={(e) => removeNotification(i)}
                         style="background-color: {notification?.bgColor ? notification.bgColor : "#dddc"};
                                color: {notification?.textColor ? notification?.textColor : "#000"};
                                font-size: {notification?.textSize ? notification?.textSize : "1em"};">
                        <svg class="close-icon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                             viewBox="0 0 94.926 94.926" style="enable-background:new 0 0 94.926 94.926;" xml:space="preserve">
                            <g>
                                <path d="M55.931,47.463L94.306,9.09c0.826-0.827,0.826-2.167,0-2.994L88.833,0.62C88.436,0.224,87.896,0,87.335,0
                                    c-0.562,0-1.101,0.224-1.498,0.62L47.463,38.994L9.089,0.62c-0.795-0.795-2.202-0.794-2.995,0L0.622,6.096
                                    c-0.827,0.827-0.827,2.167,0,2.994l38.374,38.373L0.622,85.836c-0.827,0.827-0.827,2.167,0,2.994l5.473,5.476
                                    c0.397,0.396,0.936,0.62,1.498,0.62s1.1-0.224,1.497-0.62l38.374-38.374l38.374,38.374c0.397,0.396,0.937,0.62,1.498,0.62
                                    s1.101-0.224,1.498-0.62l5.473-5.476c0.826-0.827,0.826-2.167,0-2.994L55.931,47.463z"/>
                            </g>
                        </svg>

                    <h3>{notification?.textNotification}</h3>
                    {#if notification?.signature }
                        <span class="signature">{notification?.signature}</span>
                    {/if}
                    </div>
                {/if}
            {/each}
        </div>
        <SendCommentComponent showReplyInput={false}/>
        <div class="commentDisplay">
            {#if comments.length == 0}
                <span class="no-comments">No comments yet...</span>
            {/if}
            {#each comments as comment, i}
                <CommentComponent
                        isTopLevelComment={true}
                        comment={comment}
                        replies={replies[comment.id]}
                        myComment={comment?.user?.id === user?.user?.id}/>
            {/each}
            {#if n_new_comments > 0}
                <div class="newCommentIndicator" on:click="{() => animateScroll.scrollToBottom()}">
                    <img src="../../icons/new-message.svg" alt="new comment">
                    <span>{n_new_comments}</span>
                </div>
            {/if}
            <IntersectionObserver {element} on:observe="{(e) => n_new_comments = 0}">
                <div bind:this={element} class="bottomCommentDisplay"></div>

            </IntersectionObserver>
        </div>
    </div>
    {#if y > 200}
    <div class="scrollToTop" id="scrollToTop">
        <button on:click={() => animateScroll.scrollToTop()}>
            <img src="../../icons/cd-top-arrow.svg" alt="scroll to top">
            <!-- <br> <b>To Top</b> -->
        </button>
    </div>
{/if}


</div>

<style lang="scss">
  @import "src/vars";

  .remaining-time-container {
    position: absolute;
    top: 0;
    left: 1em;
    background: white;
    padding: 1rem;
    width: 11rem;
    p {
      margin: 0;
    }
  }
  .container {
    width: 100%;
    min-height: 50vh;

    @media (min-width: $mid-bp) {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }

    .notificationArea {
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      right: 0;

      .notification {
        position: relative;
        border-top: .1rem solid rgba(0,0,0,.15);
        background: #dddc;
        padding: 1.2rem;
        width: 50vw;
        max-width: 18rem;

        .signature {
          color:rgb(31, 31, 31);
        }
        .close-icon {
          position: absolute;
          cursor: pointer;
          top: 0.5rem;
          right: 0.5rem;
          height: 1rem;
        }
      }
    }

    .center {
      display: flex;
      flex-direction: column;

      @media (min-width: $mid-bp) {
        max-width: $mid-bp;
        width: 100%;
      }

      .commentDisplay {
        min-height: 20em;
        margin: 0.5rem 1rem;

        .newCommentIndicator {
          background: white;
          position: fixed;
          bottom: 7rem;
          right: 3rem;
          width: 3rem;
          height: 3rem;
          img {
            width: 3rem;
            height: 3rem;
          }
          span {
            position: absolute;
            text-align: center;
            right: -1px;
            top: 2px;
            background: black;
            color: white;
            font-size: 15px;
            font-weight: bold;
            width: 21px;
            height: 21px;
            border-radius: 50%;
          }
        }
        .bottomCommentDisplay {
          height: 1rem;
          width: 100%;
        }
      }

    }
  }
  .scrollToTop {
    background: white;
    position: fixed;
    bottom: 3rem;
    right: 3.3rem;
    width: 2rem;
    height: 2rem;
    // reinstate clicks
    pointer-events: all;

    // basic styling
    display: inline-block !important;
    text-decoration: none;
    text-align: center;
    border-radius: 20%;
    padding: 0.25rem;

    $color: rgba(0, 0, 0, 0.9);

    // "pretty" styles, including states
    // border: 1px solid $color;
    background-color: $color; // scale-color($color, $lightness: 15%);
    transition: transform 80ms ease-in;

    &:hover,
    &:focus {
      transform: scale(1.03);
    }
    a {
      text-decoration: none;
      color: white;
      cursor: pointer;
      img {
        padding-top: 0.4rem;
      }
    }
  }
</style>
