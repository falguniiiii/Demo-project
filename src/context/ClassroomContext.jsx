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

export const ClassroomProvider = ({ children }) => {
  const [classrooms, setClassrooms] = useState([]);

  const createClassroom = (name) => {
    const newClassroom = {
      id: Date.now(),
      name: name.trim(),
      subjects: []
    };
    setClassrooms(prev => [...prev, newClassroom]);
    return newClassroom;
  };

  const addSubject = (classroomId, subjectName) => {
    const newSubject = {
      id: Date.now(),
      name: subjectName.trim(),
      files: []
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
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      url: URL.createObjectURL(file),
      type: file.type
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
            subject: subject.name
          });
        });
      });
    });
    return allDocs;
  };

  const value = {
    classrooms,
    createClassroom,
    addSubject,
    addFiles,
    deleteFile,
    getAllDocuments
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
    </ClassroomContext.Provider>
  );
};