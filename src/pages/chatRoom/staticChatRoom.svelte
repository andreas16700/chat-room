<script lang="ts">
    import type {Comment} from "../../../types/comment.type";
    import type { RoomData } from "../../../types/room.type";
    import { onMount } from "svelte";
    import { Rooms } from "../../../server/util/room";
    import { Posts } from "../../../server/util/post";
    import {CommentComponent} from "../../components/comment.svelte";
    import {SendCommentComponent} from "../../components/sendCommentComponent.svelte";

    let comments: Array<Comment> = [];
    let roomData: RoomData;
    let notifications = [];

    onMount(async () => {
        // Assuming getAvailableRooms returns an array of [hash, fileName] and we take the first one
        const availableRooms = await Rooms.getAvailableRooms();
        const [roomHash] = availableRooms[0];

        // Load static room data
        roomData = await Rooms.getStaticRoomData(roomHash);

        // Load comments from the static room data
        comments = roomData.automaticComments.map(comment => ({
            ...comment,
            time: new Date(comment.time) // Convert time to Date object if necessary
        }));
        // Load notifications from the static room data
        // Assuming that notifications are part of the RoomData type
        notifications = roomData.userModerationEvents.map(event => ({
            ...event,
            time: new Date(event.time) // Convert time to Date object if necessary
        }));
    })
</script>

<svelte:window bind:scrollY={y}/>

<svelte:head>
    <title>Discussion Room</title>
</svelte:head>

<div class="container">

    <div class="center">
        <div class="notificationArea">
            {#each notifications as notification, i}
                {#if notifications.length - 4 < i}
                    <!-- <div class="notification" on:click={(e) => removeNotification(i)} -->
                    <div class="notification" 
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
