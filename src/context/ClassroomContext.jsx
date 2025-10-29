// src/context/ClassroomContext.jsx
import React, { createContext, useState, useContext } from 'react';

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

export const ClassroomProvider = ({ children }) => {
  const [classrooms, setClassrooms] = useState([]);

  // Initialize user ID if not exists
  React.useEffect(() => {
    if (!sessionStorage.getItem('userId')) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('userId', userId);
    }
  }, []);

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
      createdBy: sessionStorage.getItem('userId'),
      createdAt: new Date().toISOString(),
      hostName: sessionStorage.getItem('hostName') || 'Host'
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
              return { ...subject, files: subject.files.filter(f => f.id !== fileId) };
            }
            return subject;
          })
        };
      }
      return classroom;
    }));
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