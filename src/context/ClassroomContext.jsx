// src/context/ClassroomContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ClassroomContext = createContext();

export const useClassrooms = () => {
  const context = useContext(ClassroomContext);
  if (!context) {
    throw new Error('useClassrooms must be used within ClassroomProvider');
  }
  return context;
};

// Generate a unique classroom code (6 characters: letters and numbers)
const generateClassroomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate a unique ID combining timestamp, random string, and user identifier
const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const userIdentifier = sessionStorage.getItem('userId') || 'anonymous';
  return `${prefix}${timestamp}_${random}_${userIdentifier}`;
};

// Storage keys
const STORAGE_KEYS = {
  CLASSROOMS: 'ruralMeet_classrooms',
  USER_ID: 'ruralMeet_userId',
  HOST_NAME: 'ruralMeet_hostName'
};

export const ClassroomProvider = ({ children }) => {
  // Initialize state from localStorage
  const [classrooms, setClassrooms] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading classrooms:', error);
      return [];
    }
  });

  // Initialize user ID if not exists
  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEYS.USER_ID)) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
  }, []);

  // Save classrooms to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
    } catch (error) {
      console.error('Error saving classrooms:', error);
    }
  }, [classrooms]);

  const createClassroom = (name) => {
    let classroomCode;
    let isUnique = false;
    
    // Ensure the generated code is unique
    while (!isUnique) {
      classroomCode = generateClassroomCode();
      isUnique = !classrooms.some(c => c.code === classroomCode);
    }

    const newClassroom = {
      id: generateUniqueId('classroom_'),
      code: classroomCode,
      name: name.trim(),
      subjects: [],
      createdBy: sessionStorage.getItem(STORAGE_KEYS.USER_ID),
      createdAt: new Date().toISOString(),
      hostName: sessionStorage.getItem(STORAGE_KEYS.HOST_NAME) || 'Host'
    };
    
    setClassrooms(prev => [...prev, newClassroom]);
    return newClassroom;
  };

  const addSubject = (classroomId, subjectName) => {
    const newSubject = {
      id: generateUniqueId('subject_'),
      name: subjectName.trim(),
      files: [],
      createdAt: new Date().toISOString()
    };
    
    setClassrooms(prev => prev.map(classroom => {
      if (classroom.id === classroomId) {
        return { ...classroom, subjects: [...classroom.subjects, newSubject] };
      }
      return classroom;
    }));
    return newSubject;
  };
  
  const addFiles = (classroomId, subjectId, files) => {
    const newFiles = Array.from(files).map(file => ({
      id: generateUniqueId('file_'),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      url: URL.createObjectURL(file),
      type: file.type,
      uploadedAt: new Date().toISOString()
    }));

    setClassrooms(prev => prev.map(classroom => {
      if (classroom.id === classroomId) {
        return {
          ...classroom,
          subjects: classroom.subjects.map(subject => {
            if (subject.id === subjectId) {
              return { ...subject, files: [...subject.files, ...newFiles] };
            }
            return subject;
          })
        };
      }
      return classroom;
    }));
  };

  const deleteFile = (classroomId, subjectId, fileId) => {
    setClassrooms(prev => prev.map(classroom => {
      if (classroom.id === classroomId) {
        return {
          ...classroom,
          subjects: classroom.subjects.map(subject => {
            if (subject.id === subjectId) {
              // Revoke the object URL to free memory
              const fileToDelete = subject.files.find(f => f.id === fileId);
              if (fileToDelete && fileToDelete.url) {
                URL.revokeObjectURL(fileToDelete.url);
              }
              return { ...subject, files: subject.files.filter(f => f.id !== fileId) };
            }
            return subject;
          })
        };
      }
      return classroom;
    }));
  };

  const deleteClassroom = (classroomId) => {
    setClassrooms(prev => {
      const classroom = prev.find(c => c.id === classroomId);
      if (classroom) {
        // Revoke all file URLs in this classroom
        classroom.subjects.forEach(subject => {
          subject.files.forEach(file => {
            if (file.url) {
              URL.revokeObjectURL(file.url);
            }
          });
        });
      }
      return prev.filter(c => c.id !== classroomId);
    });
  };

  const clearAllClassrooms = () => {
    // Revoke all object URLs before clearing
    classrooms.forEach(classroom => {
      classroom.subjects.forEach(subject => {
        subject.files.forEach(file => {
          if (file.url) {
            URL.revokeObjectURL(file.url);
          }
        });
      });
    });
    setClassrooms([]);
    localStorage.removeItem(STORAGE_KEYS.CLASSROOMS);
  };

  const getAllDocuments = () => {
    const allDocs = [];
    classrooms.forEach(classroom => {
      classroom.subjects.forEach(subject => {
        subject.files.forEach(file => {
          allDocs.push({
            ...file,
            classroom: classroom.name,
            classroomId: classroom.id,
            classroomCode: classroom.code,
            subject: subject.name
          });
        });
      });
    });
    return allDocs;
  };

  // Get classroom by code (for participants to join)
  const getClassroomByCode = (code) => {
    return classrooms.find(c => c.code === code.toUpperCase());
  };

  // Get classroom by ID
  const getClassroomById = (id) => {
    return classrooms.find(c => c.id === id);
  };

  const value = {
    classrooms,
    createClassroom,
    addSubject,
    addFiles,
    deleteFile,
    deleteClassroom,
    clearAllClassrooms,
    getAllDocuments,
    getClassroomByCode,
    getClassroomById
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
    </ClassroomContext.Provider>
  );
};