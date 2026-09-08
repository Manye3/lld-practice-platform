import React from 'react';

const DesignEditor = ({ content, onChange }) => {
  const handleAddClass = () => {
    onChange({
      ...content,
      classes: [...content.classes, { id: Date.now().toString(), name: '', responsibilities: '', attributes: '' }]
    });
  };

  const handleUpdateClass = (id, field, value) => {
    onChange({
      ...content,
      classes: content.classes.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const handleRemoveClass = (id) => {
    onChange({
      ...content,
      classes: content.classes.filter(c => c.id !== id),
      relationships: content.relationships.filter(r => r.from !== id && r.to !== id)
    });
  };

  const handleAddRelationship = () => {
    onChange({
      ...content,
      relationships: [...content.relationships, { id: Date.now().toString(), from: '', to: '', type: 'association', description: '' }]
    });
  };

  const handleUpdateRelationship = (id, field, value) => {
    onChange({
      ...content,
      relationships: content.relationships.map(r => r.id === id ? { ...r, [field]: value } : r)
    });
  };

  const handleRemoveRelationship = (id) => {
    onChange({
      ...content,
      relationships: content.relationships.filter(r => r.id !== id)
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Classes Section */}
      <div className="editor-section">
        <div className="editor-section-title">
          <span>Classes</span>
          <button className="btn btn-secondary" onClick={handleAddClass}>+ Add Class</button>
        </div>
        
        {content.classes.map((cls, index) => (
          <div key={cls.id} className="editor-item">
            <div className="editor-item-header">
              <strong>Class {index + 1}</strong>
              {content.classes.length > 1 && (
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--error)' }} onClick={() => handleRemoveClass(cls.id)}>Remove</button>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                className="form-input" 
                placeholder="e.g., User" 
                value={cls.name} 
                onChange={(e) => handleUpdateClass(cls.id, 'name', e.target.value)}
              />
            </div>
            <div className="editor-grid">
              <div className="form-group">
                <label className="form-label">Attributes (one per line)</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="- id: string&#10;- name: string" 
                  value={cls.attributes}
                  onChange={(e) => handleUpdateClass(cls.id, 'attributes', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Responsibilities (one per line)</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="- manages login&#10;- updates profile" 
                  value={cls.responsibilities}
                  onChange={(e) => handleUpdateClass(cls.id, 'responsibilities', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Relationships Section */}
      <div className="editor-section">
        <div className="editor-section-title">
          <span>Relationships</span>
          <button className="btn btn-secondary" onClick={handleAddRelationship} disabled={content.classes.length < 1}>+ Add Relationship</button>
        </div>
        
        {content.relationships.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No relationships defined.</p>
        )}

        {content.relationships.map((rel, index) => (
          <div key={rel.id} className="editor-item">
            <div className="editor-item-header">
              <strong>Relationship {index + 1}</strong>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--error)' }} onClick={() => handleRemoveRelationship(rel.id)}>Remove</button>
            </div>
            <div className="editor-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">From</label>
                <select className="form-select" value={rel.from} onChange={(e) => handleUpdateRelationship(rel.id, 'from', e.target.value)}>
                  <option value="">Select Class</option>
                  {content.classes.map(c => <option key={c.id} value={c.id}>{c.name || 'Unnamed Class'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={rel.type} onChange={(e) => handleUpdateRelationship(rel.id, 'type', e.target.value)}>
                  <option value="association">Association (uses)</option>
                  <option value="composition">Composition (owns)</option>
                  <option value="aggregation">Aggregation (has)</option>
                  <option value="inheritance">Inheritance (is a)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">To</label>
                <select className="form-select" value={rel.to} onChange={(e) => handleUpdateRelationship(rel.id, 'to', e.target.value)}>
                  <option value="">Select Class</option>
                  {content.classes.map(c => <option key={c.id} value={c.id}>{c.name || 'Unnamed Class'}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description (optional)</label>
              <input 
                className="form-input" 
                placeholder="e.g., User has multiple Orders (1:N)" 
                value={rel.description}
                onChange={(e) => handleUpdateRelationship(rel.id, 'description', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Design Decisions */}
      <div className="editor-section">
        <div className="editor-section-title">
          <span>Design Decisions</span>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <textarea 
            className="form-textarea" 
            style={{ minHeight: '120px' }}
            placeholder="Explain why you chose this design. What patterns did you use? What are the trade-offs?" 
            value={content.designDecisions}
            onChange={(e) => onChange({ ...content, designDecisions: e.target.value })}
          />
        </div>
      </div>

    </div>
  );
};

export default DesignEditor;
