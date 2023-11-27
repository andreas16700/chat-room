<script lang="ts">
    import { io } from 'socket.io-client';
    import CommentComp from './comment.svelte';
    import PostComponent from './post.svelte';
    import SendCommentComponent from './sendCommentComponent.svelte';
    import type { User } from '../../types/user.type';
    import type { Post } from '../../types/room.type';
    import type { Comment } from '../../types/comment.type';
    import { onMount } from 'svelte';

    let sampleUser: User | null = null;
    let sampleComment: Comment | null = null;
    let samplePost: Post | null = null;
    let socket;

    onMount(() => {
        socket = io();

        // Request static data for showcase
        socket.emit('requestShowcaseData');

        // Listen for the showcase data from the server
        socket.on('showcaseData', (data) => {
            console.log("received data")
            samplePost = data.post;
            sampleComment = data.comments[1];
            sampleUser = sampleComment.user; // Assuming the Comment type includes a User object
        });

        return () => {
            socket.disconnect();
        };
    });
</script>

<style>
    .showcase-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* Two columns layout */
        gap: 20px;
        padding: 20px;
    }

    .comment-send-container {
        display: flex;
        flex-direction: column; /* Stack vertically */
        gap: 20px;
    }

    .component-container {
        border: 1px solid #ddd;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        overflow: hidden;
        background: white;
        display: flex;
        flex-direction: column; /* Make sure internal components stack vertically */
    }

    .component-header {
        background: #f7f7f7;
        padding: 10px;
        font-size: 1.2em;
        font-weight: bold;
        text-align: center;
        border-bottom: 1px solid #ddd;
    }

    .component-body {
        padding: 15px;
    }
</style>


<div class="showcase-grid">
    {#if samplePost}
        <div class="component-container">
            <div class="component-header">Post Component</div>
            <div class="component-body">
                <PostComponent post={samplePost} />
            </div>
        </div>
    {/if}
    <div class="comment-send-container">
        {#if sampleComment}
            <div class="component-container">
                <div class="component-header">Comment Component</div>
                <div class="component-body">
                    <CommentComp comment={sampleComment} />
                </div>
            </div>
        {/if}
        <div class="component-container">
            <div class="component-header">Send Comment Component</div>
            <div class="component-body">
                <SendCommentComponent />
            </div>
        </div>
    </div>
</div>
