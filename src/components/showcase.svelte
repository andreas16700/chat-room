<script lang="ts">
    import CommentComp from './comment.svelte';
    import PostComponent from './post.svelte';
    import SendCommentComponent from './sendCommentComponent.svelte';
    import type {User} from '../../types/user.type'
    import type {Post} from '../../types/room.type'
    import type {Comment} from '../../types/comment.type'

    // Prepare some sample data here
    const sampleUser: User = {
        id: "user123",
        name: "John Doe",
        mTurkId: "mturk123",
        assignmentId: "assign123",
        hitId: "hit123"
    };

    const sampleComment: Comment = {
        id: 1,
        time: new Date(),
        user: sampleUser,
        content: "This is a sample comment.",
        flagged: false,
        removed: false
    };


    const samplePost: Post = {
        id: "post123",
        time: new Date(),
        title: "Sample Post Title",
        lead: "This is a lead for the sample post.",
        content: "Here is some content for the sample post.",
        imageName: "sampleImage.jpg",
    };
</script>

<style>
    .showcase-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
    }

    .component-container {
        border: 1px solid #ddd;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        overflow: hidden;
        background: white;
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
    <div class="component-container">
        <div class="component-header">Comment Component</div>
        <div class="component-body">
            <CommentComp comment={sampleComment} />
        </div>
    </div>
    <div class="component-container">
        <div class="component-header">Post Component</div>
        <div class="component-body">
            <PostComponent post={samplePost} />
        </div>
    </div>
    <div class="component-container">
        <div class="component-header">Send Comment Component</div>
        <div class="component-body">
            <SendCommentComponent />
        </div>
    </div>
</div>