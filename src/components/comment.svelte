<script lang="ts">
    import moment from "moment";
    
    import type { Comment} from "../../types/comment.type"
    import SendCommentComponent from "./sendCommentComponent.svelte"

    export let comment: Comment
    export let myComment: Boolean = false
    export let replies: Comment[] = []
    export let isTopLevelComment: Boolean = true
    let showReplyInput: Boolean = false
    //export let flagged: Boolean = false
    

    const formatTime = (date: Date): string => moment(date).format("D.MM.YYYY, HH:mm")
    console.log(JSON.stringify(comment, null, 4));
</script>

{#if comment.removed || comment.flagged}
<article class="commentCard id{comment?.id}" class:myComment={myComment}>
    <div class="commentContainer {comment?.flagged === true ? 'flagged' : ''} {comment?.removed === true ? 'removed' : ''}"
    style="
    background-color: {comment?.moderation?.bgColor ? comment?.moderation.bgColor : "#dddc"}; 
    color: {comment?.moderation?.textColor ? comment?.moderation?.textColor : "#000"};
    font-size: {comment?.moderation?.textSize ? comment?.moderation?.textSize : "1em"};
    "
    >
        <header class="CommentCard_header">
            <div class="userInfo">
                <h2 class="userName">{comment?.user?.name}</h2>
                <h3 class="time">{formatTime(comment?.time)}</h3>
            </div>
        </header>
        {#if !comment?.removed}
            <p class="text">{comment?.content}</p>
        {/if}

        {#if comment?.flagged || comment?.removed}
            <p class="moderationText {comment?.flagged === true ? 'flagged' : ''} {comment?.removed === true ? 'removed' : ''}"
            style="
            font-style: {comment?.moderation?.commentStyle ? comment?.moderation?.commentStyle : "italic"};
            color: {comment?.moderation?.commentColor ? comment?.moderation?.commentColor : "magenta"};
            font-size: {comment?.moderation?.commentSize ? comment?.moderation?.commentSize : "large"};
            font-weight: {comment?.moderation?.commentWeight ? comment?.moderation?.commentWeight : 100 };
            ">
                {comment?.moderation?.textComment}
                {#if comment?.moderation?.signature }
                    <p class="signature">{comment?.moderation?.signature}</p>
                {/if} 
            </p>
        {/if}
    </div>
    <div class="actionsContainer">

        <div class="reply-button" class:showReplyButton={isTopLevelComment}>
            <button on:click="{() => showReplyInput = !showReplyInput}">
                <span>Reply</span>
            </button>
        </div>
    </div>
    {#if showReplyInput}
        <div class="reply-input">
            <SendCommentComponent parentID={comment.id} isReply={true} bind:showReplyInput={showReplyInput}/>
        </div>
    {/if}
    {#if replies}  
        <div class="repliesContainer" class:showReplies={replies}> 
            {#each replies as reply, i}
                <comment comment={reply} replies={[]} isTopLevelComment={false} />
            {/each}
        </div>
    {/if}
</article>
{:else}
<article class="commentCard id{comment?.id}" class:myComment={myComment}>
    <div class="commentContainer">
        <header class="CommentCard_header">
            <div class="userInfo">
                <h2 class="userName">{comment?.user?.name}</h2>
                <h3 class="time">{formatTime(comment?.time)}</h3>
            </div>
        </header>
        <p class="text">{comment?.content}</p>
    </div>
    <div class="actionsContainer">
        <div class="reply-button" class:showReplyButton={isTopLevelComment}>
            <button on:click="{() => showReplyInput = !showReplyInput}">
                <span>Reply</span>
            </button>
        </div>
    </div>
    {#if showReplyInput}
        <div class="reply-input">
            <SendCommentComponent parentID={comment.id} isReply={true} bind:showReplyInput={showReplyInput}/>
        </div>
    {/if}
    {#if replies}  
        <div class="repliesContainer" class:showReplies={replies}> 
            {#each replies as reply, i}
                <comment comment={reply} replies={[]} isTopLevelComment={false} />
            {/each}
        </div>
    {/if}
</article>
{/if}

<style lang="scss">
    @import "src/vars";
    
    @keyframes newComment {
        from { background: rgb(179, 179, 179)}
        to   { background: white}
    }

    // .commentCard:last-of-type {
    //     border-bottom: .0625rem solid rgba(0,0,0,.15);
    // }
    
    .signature {
        font-size-adjust: 0.1;
    }

    .commentCard {
        border-top: .0625rem solid rgba(0,0,0,.15);
        color: #1a1a1a;
        padding: 0.5rem;
        animation: newComment 2s linear;

        header {
            align-items: center;
            display: flex;
            .userInfo {
                margin-left: .625rem;
                font-size: .875rem;
                line-height: 1.5rem;
                .userName {
                    font-size: medium;
                    font-weight: 900;
                    margin: 0;
                }
                .time {
                    font-weight: 400;
                    font-size: small;
                    margin: 0;
                }
            }
        }

        p.text {
            padding: 0 .625rem 0 0.625rem;
            font-size: 1rem;
            line-height: 1.4375rem;
        }
        .actionsContainer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 0 .625rem 0 0.625rem;
            align-items: center;
            
            .reply-button {
                display: none;
                button {
                    width: 5em;
                    background: rgb(189, 193, 248);
                    border: #1a1a1a bold 2px;
                }
            }
            .reply-button.showReplyButton {
                display: block;
            }

        }
        button {
            width: 5em;
            background: rgb(189, 193, 248);
            border: #1a1a1a bold 2px;
        }

        .reply-input {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .repliesContainer {
            margin-left: 2rem;
        }

    }
</style>
