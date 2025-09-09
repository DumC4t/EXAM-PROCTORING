"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Users, AlertTriangle, Eye, Clock, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, FileText, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Student {
  id: string
  name: string
  examId: string
  examTitle: string
  status: "active" | "completed" | "flagged"
  violations: number
  lastActivity: string
  timeRemaining: number
}

interface Violation {
  id: string
  studentId: string
  studentName: string
  examId: string
  examTitle: string
  type: string
  description: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

interface Exam {
  id: string
  title: string
  description: string
  formUrl: string
  duration: number
  startTime: string
  endTime: string
  status: "draft" | "active" | "completed" | "cancelled"
  createdAt: string
  uniqueId: string
}

export default function TeacherDashboard() {
  const [teacherEmail, setTeacherEmail] = useState("")
  const [activeStudents, setActiveStudents] = useState<Student[]>([])
  const [recentViolations, setRecentViolations] = useState<Violation[]>([])
  const [exams, setExams] = useState<Exam[]>([])

  const [stats, setStats] = useState({
    totalActive: 0,
    totalViolations: 0,
    flaggedStudents: 0,
  })

  // Dialog states
  const [showCreateExam, setShowCreateExam] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)

  // Form states
  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    formUrl: "",
    duration: 60,
    startTime: "",
    endTime: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const storedEmail = localStorage.getItem("teacherEmail")
    const userRole = localStorage.getItem("userRole")

    if (!storedEmail || userRole !== "teacher") {
      router.push("/")
      return
    }

    setTeacherEmail(storedEmail)
    loadTeacherData()
  }, [router])

  const loadTeacherData = () => {
    // Load saved data or use mock data
    const savedExams = localStorage.getItem("teacherExams")

    const mockStudents: Student[] = [
      {
        id: "STU001",
        name: "John Smith",
        examId: "exam1",
        examTitle: "Mathematics Final Exam",
        status: "active",
        violations: 0,
        lastActivity: "2 minutes ago",
        timeRemaining: 5400,
      },
      {
        id: "STU002",
        name: "Sarah Johnson",
        examId: "exam1",
        examTitle: "Mathematics Final Exam",
        status: "flagged",
        violations: 3,
        lastActivity: "1 minute ago",
        timeRemaining: 5200,
      },
      {
        id: "STU003",
        name: "Mike Davis",
        examId: "exam1",
        examTitle: "Mathematics Final Exam",
        status: "active",
        violations: 1,
        lastActivity: "30 seconds ago",
        timeRemaining: 5800,
      },
    ]

    const mockViolations: Violation[] = [
      {
        id: "v1",
        studentId: "STU002",
        studentName: "Sarah Johnson",
        examId: "exam1",
        examTitle: "Mathematics Final Exam",
        type: "TAB_SWITCH",
        description: "Student switched tabs or minimized window",
        timestamp: new Date().toISOString(),
        severity: "high",
      },
      {
        id: "v2",
        studentId: "STU002",
        studentName: "Sarah Johnson",
        examId: "exam1",
        examTitle: "Mathematics Final Exam",
        type: "FULLSCREEN_EXIT",
        description: "Student exited fullscreen mode during exam",
        timestamp: new Date().toISOString(),
        severity: "high",
      },
      {
        id: "v3",
        studentId: "STU003",
        studentName: "Mike Davis",
        examId: "exam1",
        examTitle: "Mathematics Final Exam",
        type: "RIGHT_CLICK",
        description: "Student attempted to right-click",
        timestamp: new Date().toISOString(),
        severity: "medium",
      },
    ]

    const mockExams: Exam[] = savedExams
      ? JSON.parse(savedExams)
      : [
          {
            id: "exam1",
            title: "Mathematics Final Exam",
            description: "Comprehensive final examination covering all topics",
            formUrl: "https://forms.google.com/sample-math-exam",
            duration: 120,
            startTime: "2024-01-20T10:00",
            endTime: "2024-01-20T12:00",
            status: "active",
            createdAt: "2024-01-20",
            uniqueId: "MATH2024001",
          },
          {
            id: "exam2",
            title: "Physics Quiz",
            description: "Weekly physics quiz on mechanics",
            formUrl: "https://forms.google.com/sample-physics-quiz",
            duration: 60,
            startTime: "2024-01-21T14:00",
            endTime: "2024-01-21T15:00",
            status: "draft",
            createdAt: "2024-01-21",
            uniqueId: "PHYS2024002",
          },
        ]

    setActiveStudents(mockStudents)
    setRecentViolations(mockViolations)
    setExams(mockExams)
    setStats({
      totalActive: mockStudents.filter((s) => s.status === "active" || s.status === "flagged").length,
      totalViolations: mockViolations.length,
      flaggedStudents: mockStudents.filter((s) => s.status === "flagged").length,
    })

    // Save to localStorage
    localStorage.setItem("teacherExams", JSON.stringify(mockExams))
  }

  const handleCreateExam = () => {
    if (!newExam.title || !newExam.formUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Generate unique form ID
    const generateUniqueId = () => {
      const prefix = newExam.title
        .substring(0, 4)
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .padEnd(4, "X") // Ensure we have at least 4 characters
      const year = new Date().getFullYear()
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      return `${prefix}${year}${random}`
    }

    const uniqueId = generateUniqueId()

    const exam: Exam = {
      id: Date.now().toString(),
      ...newExam,
      uniqueId: uniqueId,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
    }

    const updatedExams = [...exams, exam]
    setExams(updatedExams)
    localStorage.setItem("teacherExams", JSON.stringify(updatedExams))

    toast({
      title: "Exam Created Successfully!",
      description: `${newExam.title} created with Unique Form ID: ${uniqueId}`,
    })

    setShowCreateExam(false)
    setNewExam({
      title: "",
      description: "",
      formUrl: "",
      duration: 60,
      startTime: "",
      endTime: "",
    })
  }

  const handleEditExam = (exam: Exam) => {
    const updatedExams = exams.map((e) => (e.id === exam.id ? exam : e))
    setExams(updatedExams)
    localStorage.setItem("teacherExams", JSON.stringify(updatedExams))

    toast({
      title: "Success",
      description: "Exam updated successfully",
    })

    setEditingExam(null)
  }

  const handleDeleteExam = (examId: string) => {
    const updatedExams = exams.filter((e) => e.id !== examId)
    setExams(updatedExams)
    localStorage.setItem("teacherExams", JSON.stringify(updatedExams))

    toast({
      title: "Success",
      description: "Exam deleted successfully",
    })
  }

  const handleActivateExam = (examId: string) => {
    const updatedExams = exams.map((e) => (e.id === examId ? { ...e, status: "active" as const } : e))
    setExams(updatedExams)
    localStorage.setItem("teacherExams", JSON.stringify(updatedExams))

    toast({
      title: "Success",
      description: "Exam activated successfully",
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("teacherEmail")
    localStorage.removeItem("userRole")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "flagged":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "draft":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">IT Proctool Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">{teacherEmail}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActive}</div>
              <p className="text-xs text-muted-foreground">Currently taking exams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalViolations}</div>
              <p className="text-xs text-muted-foreground">Detected today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Dialog open={showCreateExam} onOpenChange={setShowCreateExam}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Exam
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
                    <DialogDescription>Set up a new proctored exam with form integration</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>📋 Unique Form ID:</strong> A unique ID will be automatically generated for this exam
                        (e.g., MATH2024001) that students will use to access the exam directly.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="examTitle">Exam Title *</Label>
                      <Input
                        id="examTitle"
                        placeholder="e.g., Mathematics Final Exam"
                        value={newExam.title}
                        onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">First 4 letters will be used for the unique ID</p>
                    </div>

                    {/* Rest of the form fields remain the same */}
                    <div>
                      <Label htmlFor="examDescription">Description</Label>
                      <Textarea
                        id="examDescription"
                        placeholder="Brief description of the exam"
                        value={newExam.description}
                        onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="formUrl">Form URL *</Label>
                      <Input
                        id="formUrl"
                        placeholder="https://forms.google.com/..."
                        value={newExam.formUrl}
                        onChange={(e) => setNewExam({ ...newExam, formUrl: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supports Google Forms, Typeform, Microsoft Forms, etc.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newExam.duration}
                          onChange={(e) => setNewExam({ ...newExam, duration: Number.parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={newExam.startTime}
                          onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateExam} className="w-full">
                      Create Exam & Generate Unique ID
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="violations">Violations Log</TabsTrigger>
            <TabsTrigger value="exams">My Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6">
            {/* Active Alerts */}
            {stats.flaggedStudents > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>{stats.flaggedStudents} student(s)</strong> have been flagged for suspicious activity. Review
                  their violations below.
                </AlertDescription>
              </Alert>
            )}

            {/* Active Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Exam Sessions
                </CardTitle>
                <CardDescription>Real-time monitoring of students currently taking exams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.examTitle}</p>
                        </div>
                        <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{student.violations} violations</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(student.timeRemaining)} left</span>
                        </div>
                        <div>Last activity: {student.lastActivity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Violations
                </CardTitle>
                <CardDescription>Detailed log of all detected violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentViolations.map((violation) => (
                    <div key={violation.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{violation.studentName}</h3>
                          <Badge className={getSeverityColor(violation.severity)}>{violation.severity}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{violation.examTitle}</p>
                        <p className="text-sm">{violation.description}</p>
                      </div>

                      <div className="text-right text-sm text-gray-600">
                        <p>{new Date(violation.timestamp).toLocaleString()}</p>
                        <p className="text-xs">{violation.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      My Exams
                    </CardTitle>
                    <CardDescription>Manage your created exams and forms</CardDescription>
                  </div>
                  <Dialog open={showCreateExam} onOpenChange={setShowCreateExam}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Exam
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{exam.title}</h3>
                        <p className="text-sm text-gray-600">{exam.description}</p>
                        <p className="text-xs text-gray-500">
                          Created: {exam.createdAt} • Duration: {exam.duration} min
                        </p>
                        <p className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mt-1">
                          Form ID: {exam.uniqueId}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(exam.status)}>{exam.status}</Badge>

                        {exam.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateExam(exam.id)}
                            className="text-green-600"
                          >
                            Activate
                          </Button>
                        )}

                        <Dialog
                          open={editingExam?.id === exam.id}
                          onOpenChange={(open) => !open && setEditingExam(null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingExam(exam)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Exam</DialogTitle>
                              <DialogDescription>Update exam information</DialogDescription>
                            </DialogHeader>
                            {editingExam && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editExamTitle">Exam Title</Label>
                                  <Input
                                    id="editExamTitle"
                                    value={editingExam.title}
                                    onChange={(e) => setEditingExam({ ...editingExam, title: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editExamDescription">Description</Label>
                                  <Textarea
                                    id="editExamDescription"
                                    value={editingExam.description}
                                    onChange={(e) => setEditingExam({ ...editingExam, description: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editFormUrl">Form URL</Label>
                                  <Input
                                    id="editFormUrl"
                                    value={editingExam.formUrl}
                                    onChange={(e) => setEditingExam({ ...editingExam, formUrl: e.target.value })}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="editDuration">Duration (minutes)</Label>
                                    <Input
                                      id="editDuration"
                                      type="number"
                                      value={editingExam.duration}
                                      onChange={(e) =>
                                        setEditingExam({ ...editingExam, duration: Number.parseInt(e.target.value) })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editStatus">Status</Label>
                                    <Select
                                      value={editingExam.status}
                                      onValueChange={(value: "draft" | "active" | "completed" | "cancelled") =>
                                        setEditingExam({ ...editingExam, status: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <Button onClick={() => handleEditExam(editingExam)} className="w-full">
                                  Update Exam
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{exam.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteExam(exam.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
