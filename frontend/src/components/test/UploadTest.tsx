"use client";

import React, { useState } from 'react';
import { useAI, useJobs } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';

export default function UploadTest() {
  const { jobs, createJob } = useJobs();
  const { screenResumes, uploadProgress, isUploading } = useAI();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [testJobId, setTestJobId] = useState<string>('');
  const [testResults, setTestResults] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleCreateTestJob = async () => {
    try {
      const jobData = {
        title: 'Test Job for Upload Integration',
        description: 'This is a comprehensive test job created to validate the upload functionality and AI screening integration. We are looking for candidates who can demonstrate strong technical skills and problem-solving abilities. The ideal candidate should have experience with modern web technologies and be able to work effectively in a team environment. This position offers an excellent opportunity to work on challenging projects and grow professionally while contributing to innovative solutions that make a real impact.'
      };
      
      const newJob = await createJob(jobData);
      setTestJobId(newJob._id);
      setTestResults(`✅ Test job created: ${newJob._id}`);
    } catch (error) {
      setTestResults(`❌ Failed to create job: ${error}`);
    }
  };

  const handleTestUpload = async () => {
    if (!testJobId) {
      setTestResults('❌ Please create a test job first');
      return;
    }

    if (selectedFiles.length === 0) {
      setTestResults('❌ Please select files to upload');
      return;
    }

    try {
      setTestResults(`🚀 Starting upload of ${selectedFiles.length} files...`);
      
      const result = await screenResumes(testJobId, selectedFiles);
      
      setTestResults(`✅ Upload successful! Processed ${result.processed} files, created ${result.candidates.length} candidates`);
      
      // Log candidate details for testing
      console.log('Screening Results:', result);
      result.candidates.forEach((candidate, index) => {
        console.log(`Candidate ${index + 1}:`, {
          name: candidate.name,
          score: candidate.score,
          status: candidate.status,
          skills: candidate.top_skills,
          summary: candidate.summary
        });
      });
    } catch (error) {
      setTestResults(`❌ Upload failed: ${error}`);
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <Typography variant="h1" className="text-2xl font-bold mb-6">
        🧪 Upload & AI Integration Test
      </Typography>

      {/* Test Results */}
      {testResults && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <Typography variant="body" className="text-sm">
            {testResults}
          </Typography>
        </Card>
      )}

      {/* Test Job Creation */}
      <Card className="p-6 space-y-4">
        <Typography variant="h2" className="text-lg font-semibold">
          Step 1: Create Test Job
        </Typography>
        <Button 
          onClick={handleCreateTestJob}
          disabled={!!testJobId}
          className="w-full"
        >
          {testJobId ? '✅ Test Job Created' : 'Create Test Job'}
        </Button>
        {testJobId && (
          <Typography variant="caption" className="text-green-600">
            Job ID: {testJobId}
          </Typography>
        )}
      </Card>

      {/* File Upload */}
      <Card className="p-6 space-y-4">
        <Typography variant="h2" className="text-lg font-semibold">
          Step 2: Upload Resume Files
        </Typography>
        
        <div className="space-y-4">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Typography variant="caption" className="text-gray-600">
                Selected files:
              </Typography>
              {selectedFiles.map((file, index) => (
                <Typography key={index} variant="caption" className="block text-gray-500">
                  • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              ))}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <Typography variant="caption" className="text-blue-600">
                Upload Progress: {uploadProgress}%
              </Typography>
            </div>
          )}

          <Button 
            onClick={handleTestUpload}
            disabled={!testJobId || selectedFiles.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Test Upload & AI Screening'}
          </Button>
        </div>
      </Card>

      {/* Existing Jobs */}
      <Card className="p-6 space-y-4">
        <Typography variant="h2" className="text-lg font-semibold">
          Existing Jobs ({jobs.length})
        </Typography>
        <div className="space-y-2">
          {jobs.map((job) => (
            <div key={job._id} className="p-3 border border-gray-200 rounded-lg">
              <Typography variant="body" className="font-medium">
                {job.title}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                ID: {job._id}
              </Typography>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
