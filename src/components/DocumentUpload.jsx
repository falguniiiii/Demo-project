// src/components/DocumentUpload.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Plus, Upload, X, FileText, Trash2 } from 'lucide-react';
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

  // Create Classroom
  const handleCreateClassroom = () => {
    if (!newClassroomName.trim()) {
      alert('Please enter classroom name');
      return;
    }
    createClassroom(newClassroomName);
    setNewClassroomName('');
    setShowCreateClassroom(false);
  };

  // Add Subject to Classroom
  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      alert('Please enter subject name');
      return;
    }
    addSubject(selectedClassroom.id, newSubjectName);
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  // Upload Files to Subject
  const handleFileUpload = (e, classroomId, subjectId) => {
    addFiles(classroomId, subjectId, e.target.files);
  };

  // Delete File
  const handleDeleteFile = (classroomId, subjectId, fileId) => {
    deleteFile(classroomId, subjectId, fileId);
  };

  // Done - Navigate to Meeting with Documents
  const handleDone = () => {
    const allDocs = getAllDocuments();
    navigate('/meeting', {
      state: { docs: allDocs }
    });
  };

  return (
    <div className="doc-upload">
      <div className="doc-upload__header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>Upload Documents</h1>
        {classrooms.length > 0 && (
          <button onClick={handleDone} className="done-btn">
            Done & Start Meeting
          </button>
        )}
      </div>

      <div className="doc-upload__container">
        {/* Create Classroom Button */}
        {classrooms.length === 0 ? (
          <div className="empty-state">
            <FolderPlus size={64} color="#9ca3af" />
            <h2>No Classrooms Yet</h2>
            <p>Create a classroom to organize your documents</p>
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
                  <h3>{classroom.name}</h3>
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
                    <p className="no-subjects">No subjects added yet</p>
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
                              onChange={(e) => handleFileUpload(e, classroom.id, subject.id)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>

                        <div className="files-list">
                          {subject.files.map(file => (
                            <div key={file.id} className="file-item">
                              <FileText size={16} />
                              <div className="file-info">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{file.size}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteFile(classroom.id, subject.id, file.id)}
                                className="delete-file-btn"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
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
        <div className="modal-overlay" onClick={() => setShowCreateClassroom(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Classroom</h2>
              <button onClick={() => setShowCreateClassroom(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                placeholder="Enter classroom name"
                className="modal-input"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateClassroom(false)} className="cancel-btn">
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
        <div className="modal-overlay" onClick={() => setShowAddSubject(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Subject to {selectedClassroom?.name}</h2>
              <button onClick={() => setShowAddSubject(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Enter subject name (e.g., Algebra)"
                className="modal-input"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddSubject(false)} className="cancel-btn">
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