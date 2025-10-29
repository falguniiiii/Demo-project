// src/components/DocumentUpload.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FolderPlus, Plus, Upload, X, FileText, Trash2, Copy, Check } from 'lucide-react';
import { useClassrooms } from '../context/ClassroomContext';
import './DocumentUpload.css';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { 
    classrooms, 
    createClassroom, 
    addSubject, 
    addFiles, 
    deleteFile,
    getAllDocuments 
  } = useClassrooms();

  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [errors, setErrors] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);

  // Validation functions
  const validateClassroomName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Classroom name is required';
    }
    if (trimmed.length < 2) {
      return 'Classroom name must be at least 2 characters';
    }
    if (trimmed.length > 50) {
      return 'Classroom name must be less than 50 characters';
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      return 'Classroom name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    return null;
  };

  const validateSubjectName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Subject name is required';
    }
    if (trimmed.length < 2) {
      return 'Subject name must be at least 2 characters';
    }
    if (trimmed.length > 50) {
      return 'Subject name must be less than 50 characters';
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      return 'Subject name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    if (selectedClassroom && selectedClassroom.subjects.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      return 'A subject with this name already exists in this classroom';
    }
    return null;
  };

  // Copy classroom code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      alert('Failed to copy code');
    }
  };

  // Create Classroom with validation
  const handleCreateClassroom = () => {
    const error = validateClassroomName(newClassroomName);
    if (error) {
      setErrors({ classroom: error });
      return;
    }
    const classroom = createClassroom(newClassroomName.trim());
    setNewClassroomName('');
    setShowCreateClassroom(false);
    setErrors({});
    
    // Show the classroom code to the user
    alert(`Classroom created!\n\nClassroom Code: ${classroom.code}\n\nShare this code with participants so they can join your classroom.`);
  };

  // Add Subject with validation
  const handleAddSubject = () => {
    const error = validateSubjectName(newSubjectName);
    if (error) {
      setErrors({ subject: error });
      return;
    }
    addSubject(selectedClassroom.id, newSubjectName.trim());
    setNewSubjectName('');
    setShowAddSubject(false);
    setErrors({});
  };

  // Upload Files with validation
  const handleFileUpload = (e, classroomId, subjectId) => {
    const files = Array.from(e.target.files);
    
    // Validate file types (allow common document formats)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Please upload PDF, Word, Excel, PowerPoint, text, or image files only.`);
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum file size is 10MB.`);
      e.target.value = '';
      return;
    }

    addFiles(classroomId, subjectId, e.target.files);
    e.target.value = '';
  };

  // Delete File with confirmation
  const handleDeleteFile = (classroomId, subjectId, fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      deleteFile(classroomId, subjectId, fileId);
    }
  };

  // Done - Navigate to Meeting with Documents
  const handleDone = () => {
    const allDocs = getAllDocuments();
    if (allDocs.length === 0) {
      alert('Please upload at least one document before starting the meeting.');
      return;
    }
    navigate('/meeting', {
      state: { docs: allDocs }
    });
  };

  const handleBackClick = () => {
    if (classrooms.length > 0) {
      const hasUnsavedChanges = window.confirm('You have created classrooms. Are you sure you want to go back?');
      if (!hasUnsavedChanges) return;
    }
    navigate("/host");
  };

  const handleCloseCreateClassroom = () => {
    setShowCreateClassroom(false);
    setNewClassroomName('');
    setErrors({});
  };

  const handleCloseAddSubject = () => {
    setShowAddSubject(false);
    setNewSubjectName('');
    setErrors({});
  };

  const handleClassroomNameChange = (e) => {
    setNewClassroomName(e.target.value);
    if (errors.classroom) {
      setErrors({ ...errors, classroom: null });
    }
  };

  const handleSubjectNameChange = (e) => {
    setNewSubjectName(e.target.value);
    if (errors.subject) {
      setErrors({ ...errors, subject: null });
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="doc-upload">
      <div className="doc-upload__header">
        <div className="doc-upload__header-left">
          <button type="button" className="back-btn" onClick={handleBackClick} aria-label="Go back" title="Go back">
            <FiArrowLeft />
          </button>
          <span className="brand brand--xl">Rural Meet</span>
        </div>
        <h1>Upload Documents</h1>
        {classrooms.length > 0 && (
          <button onClick={handleDone} className="done-btn">
            Done & Start Meeting
          </button>
        )}
      </div>

      <div className="doc-upload__container">
        {classrooms.length === 0 ? (
          <div className="empty-state">
            <FolderPlus size={64} color="#9ca3af" />
            <h2>No Classrooms Yet</h2>
            <p>Create a classroom to organize your documents by grade or category</p>
            <button onClick={() => setShowCreateClassroom(true)} className="create-classroom-btn">
              <Plus size={20} />
              Create Classroom
            </button>
          </div>
        ) : (
          <div className="classrooms-grid">
            {classrooms.map(classroom => (
              <div key={classroom.id} className="classroom-card">
                <div className="classroom-card__header">
                  <div>
                    <h3>{classroom.name}</h3>
                    <div className="classroom-code">
                      <span className="code-label">Code:</span>
                      <span className="code-value">{classroom.code}</span>
                      <button
                        onClick={() => handleCopyCode(classroom.code)}
                        className="copy-code-btn"
                        title="Copy classroom code"
                      >
                        {copiedCode === classroom.code ? (
                          <Check size={14} color="#10b981" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClassroom(classroom);
                      setShowAddSubject(true);
                    }}
                    className="add-subject-btn"
                  >
                    <Plus size={16} />
                    Add Subject
                  </button>
                </div>

                <div className="subjects-list">
                  {classroom.subjects.length === 0 ? (
                    <p className="no-subjects">No subjects added yet. Add a subject to start uploading documents.</p>
                  ) : (
                    classroom.subjects.map(subject => (
                      <div key={subject.id} className="subject-item">
                        <div className="subject-header">
                          <h4>{subject.name}</h4>
                          <label className="upload-label">
                            <Upload size={16} />
                            Upload
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                              onChange={(e) => handleFileUpload(e, classroom.id, subject.id)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>

                        <div className="files-list">
                          {subject.files.length === 0 ? (
                            <p className="no-files">No documents uploaded yet</p>
                          ) : (
                            subject.files.map(file => (
                              <div key={file.id} className="file-item">
                                <FileText size={16} />
                                <div className="file-info">
                                  <span className="file-name">{file.name}</span>
                                  <span className="file-size">{file.size}</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteFile(classroom.id, subject.id, file.id, file.name)}
                                  className="delete-file-btn"
                                  title="Delete file"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowCreateClassroom(true)}
              className="add-classroom-card"
            >
              <Plus size={32} />
              <span>Add Classroom</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Classroom Modal */}
      {showCreateClassroom && (
        <div className="modal-overlay" onClick={handleCloseCreateClassroom}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Classroom</h2>
              <button onClick={handleCloseCreateClassroom}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newClassroomName}
                onChange={handleClassroomNameChange}
                onKeyPress={(e) => handleKeyPress(e, handleCreateClassroom)}
                placeholder="Enter classroom name (e.g., Grade 10, Science Class)"
                className={`modal-input ${errors.classroom ? 'modal-input--error' : ''}`}
                autoFocus
                maxLength={50}
              />
              {errors.classroom && (
                <p className="error-message">{errors.classroom}</p>
              )}
              <p className="input-hint">Use descriptive names like "Grade 10" or "Advanced Mathematics"</p>
              <p className="input-hint" style={{ marginTop: '8px', fontWeight: '500' }}>
                A unique 6-character code will be generated that participants can use to join this classroom
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseCreateClassroom} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleCreateClassroom} className="create-btn">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="modal-overlay" onClick={handleCloseAddSubject}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Subject to {selectedClassroom?.name}</h2>
              <button onClick={handleCloseAddSubject}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newSubjectName}
                onChange={handleSubjectNameChange}
                onKeyPress={(e) => handleKeyPress(e, handleAddSubject)}
                placeholder="Enter subject name (e.g., Mathematics, Physics)"
                className={`modal-input ${errors.subject ? 'modal-input--error' : ''}`}
                autoFocus
                maxLength={50}
              />
              {errors.subject && (
                <p className="error-message">{errors.subject}</p>
              )}
              <p className="input-hint">Examples: Mathematics, English Literature, Chemistry</p>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseAddSubject} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleAddSubject} className="create-btn">
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;