import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Plus, Send, Tag, X } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

// AI Senior Mentor Community — submitted-feature #3. Freshers post
// questions or share projects, seniors (and peers) reply in threaded
// comments. Backed by /api/community (routes/communityRoutes.js).
export default function CommunityFeedTab() {
  const {
    communityPosts, communityLoading, loadCommunityPosts,
    createCommunityPost, addCommunityComment
  } = useCampus();

  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});

  useEffect(() => {
    loadCommunityPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await createCommunityPost({ title: title.trim(), content: content.trim(), tags: tags.trim() });
      setTitle('');
      setContent('');
      setTags('');
      setComposerOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (postId) => {
    const draft = (commentDrafts[postId] || '').trim();
    if (!draft) return;
    await addCommunityComment(postId, draft);
    setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Users className="w-3.5 h-3.5 text-purple" />
          <span>SENIOR MENTOR COMMUNITY</span>
        </h4>
        <button
          type="button"
          onClick={() => setComposerOpen(v => !v)}
          className="community-new-post-btn"
        >
          {composerOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{composerOpen ? 'Cancel' : 'New Post'}</span>
        </button>
      </div>

      {composerOpen && (
        <form onSubmit={handleCreatePost} className="info-card community-composer">
          <div className="input-label-group">
            <span>TITLE</span>
            <input
              className="admin-input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How do seniors manage DSA + coursework?"
              required
            />
          </div>
          <div className="input-label-group">
            <span>YOUR QUESTION OR PROJECT UPDATE</span>
            <textarea
              className="admin-input-field"
              style={{ minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share context so seniors can give a useful answer..."
              required
            />
          </div>
          <div className="input-label-group">
            <span>TAGS (comma-separated, optional)</span>
            <input
              className="admin-input-field"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. DSA, Placements, Hackathons"
            />
          </div>
          <button type="submit" className="community-submit-btn" disabled={submitting}>
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Post to Community'}</span>
          </button>
        </form>
      )}

      {communityLoading && communityPosts.length === 0 && (
        <p className="text-muted" style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '2rem 0' }}>Loading community feed...</p>
      )}

      {!communityLoading && communityPosts.length === 0 && (
        <p className="text-muted" style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '2rem 0' }}>
          No posts yet. Be the first to ask seniors a question or share a project.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {communityPosts.map((post) => {
          const isExpanded = expandedPostId === post.id;
          const tagList = (post.tags || '').split(',').map(t => t.trim()).filter(Boolean);
          return (
            <div key={post.id} className="info-card community-post-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '12.5px' }}>{post.title}</p>
                  <p className="text-muted" style={{ fontSize: '9px', marginTop: '0.1rem' }}>
                    {post.student?.name || 'Student'} &middot; {post.student?.department} Year {post.student?.year}
                  </p>
                </div>
                <span className="text-muted" style={{ fontSize: '9px', whiteSpace: 'nowrap' }}>
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '0.5rem', lineHeight: 1.5 }}>{post.content}</p>

              {tagList.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
                  {tagList.map((tag, i) => (
                    <span key={i} className="community-tag-badge">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="community-comments-toggle"
                onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{post.comments?.length || 0} comment{post.comments?.length === 1 ? '' : 's'}</span>
              </button>

              {isExpanded && (
                <div className="community-comments-panel">
                  {(post.comments || []).map((c) => (
                    <div key={c.id} className="community-comment-row">
                      <span className="community-comment-author">{c.student?.name || 'Student'} (Y{c.student?.year})</span>
                      <p>{c.content}</p>
                    </div>
                  ))}
                  {(post.comments || []).length === 0 && (
                    <p className="text-muted" style={{ fontSize: '10px', fontStyle: 'italic' }}>No replies yet — be the first senior to help.</p>
                  )}
                  <div className="community-comment-input-row">
                    <input
                      className="admin-input-field"
                      style={{ flex: 1 }}
                      placeholder="Write a reply..."
                      value={commentDrafts[post.id] || ''}
                      onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(post.id); } }}
                    />
                    <button type="button" className="community-comment-send-btn" onClick={() => handleAddComment(post.id)}>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
