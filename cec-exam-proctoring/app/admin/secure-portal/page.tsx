"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Users, Settings, Database, AlertTriangle, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Student {
  id: string
  name: string
  email: string
  studentId: string
  status: "active" | "suspended"
  createdAt: string
}

interface Teacher {
  id: string
  name: string
  email: string
  department: string
  status: "active" | "inactive"
  createdAt: string
}

interface SystemLog {
  id: string
  type: "login" | "violation" | "system" | "error"
  message: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

interface SystemSettings {
  fullscreenRequired: boolean
  tabSwitchingDetection: boolean
  inactivityTimeout: number
  violationThreshold: number
  keyboardShortcutsBlocked: boolean
  rightClickDisabled: boolean
  devToolsDetection: boolean
  sessionTimeout: number
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [settings, setSettings] = useState<SystemSettings>({
    fullscreenRequired: true,
    tabSwitchingDetection: true,
    inactivityTimeout: 300,
    violationThreshold: 3,
    keyboardShortcutsBlocked: true,
    rightClickDisabled: true,
    devToolsDetection: true,
    sessionTimeout: 1800,
  })

  // Dialog states
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)

  // Form states
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    studentId: "",
    status: "active" as "active" | "suspended",
  })
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    department: "",
    status: "active" as "active" | "inactive",
  })

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeExams: 0,
    totalViolations: 0,
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if already authenticated
    const adminAuth = localStorage.getItem("adminAuthenticated")
    if (adminAuth === "true") {
      setIsAuthenticated(true)
      loadAdminData()
    }
  }, [])

  const handleAdminLogin = () => {
    if (adminEmail === "admin@itproctool.edu" && adminPassword === "SecureAdmin2024!") {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuthenticated", "true")
      loadAdminData()
      addSystemLog("login", `Admin login: ${adminEmail}`, "low")
      toast({
        title: "Access Granted",
        description: "Welcome to the admin portal",
      })
    } else {
      addSystemLog("error", `Failed admin login attempt: ${adminEmail}`, "high")
      toast({
        title: "Access Denied",
        description: "Invalid administrator credentials",
        variant: "destructive",
      })
    }
  }

  const loadAdminData = () => {
    // Load from localStorage or use mock data
    const savedStudents = localStorage.getItem("adminStudents")
    const savedTeachers = localStorage.getItem("adminTeachers")
    const savedLogs = localStorage.getItem("systemLogs")
    const savedSettings = localStorage.getItem("systemSettings")

    const mockStudents: Student[] = savedStudents
      ? JSON.parse(savedStudents)
      : [
          {
            id: "1",
            name: "John Smith",
            email: "john.smith@student.cec.edu",
            studentId: "STU001",
            status: "active",
            createdAt: "2024-01-15",
          },
          {
            id: "2",
            name: "Sarah Johnson",
            email: "sarah.johnson@student.cec.edu",
            studentId: "STU002",
            status: "active",
            createdAt: "2024-01-16",
          },
          {
            id: "3",
            name: "Mike Davis",
            email: "mike.davis@student.cec.edu",
            studentId: "STU003",
            status: "suspended",
            createdAt: "2024-01-17",
          },
        ]

    const mockTeachers: Teacher[] = savedTeachers
      ? JSON.parse(savedTeachers)
      : [
          {
            id: "1",
            name: "Dr. Emily Wilson",
            email: "teacher@cec.edu",
            department: "Mathematics",
            status: "active",
            createdAt: "2024-01-10",
          },
          {
            id: "2",
            name: "Prof. Robert Chen",
            email: "robert.chen@cec.edu",
            department: "Physics",
            status: "active",
            createdAt: "2024-01-11",
          },
        ]

    const mockLogs: SystemLog[] = savedLogs
      ? JSON.parse(savedLogs)
      : [
          {
            id: "1",
            type: "violation",
            message: "Student STU002 flagged for multiple tab switching violations",
            timestamp: new Date().toISOString(),
            severity: "high",
          },
          {
            id: "2",
            type: "login",
            message: "Teacher login: teacher@cec.edu",
            timestamp: new Date().toISOString(),
            severity: "low",
          },
        ]

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    setStudents(mockStudents)
    setTeachers(mockTeachers)
    setSystemLogs(mockLogs)
    setStats({
      totalStudents: mockStudents.length,
      totalTeachers: mockTeachers.length,
      activeExams: 3,
      totalViolations: 15,
    })

    // Save to localStorage
    localStorage.setItem("adminStudents", JSON.stringify(mockStudents))
    localStorage.setItem("adminTeachers", JSON.stringify(mockTeachers))
    localStorage.setItem("systemLogs", JSON.stringify(mockLogs))
  }

  const addSystemLog = (type: SystemLog["type"], message: string, severity: SystemLog["severity"]) => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString(),
      severity,
    }
    const updatedLogs = [newLog, ...systemLogs].slice(0, 50) // Keep only last 50 logs
    setSystemLogs(updatedLogs)
    localStorage.setItem("systemLogs", JSON.stringify(updatedLogs))
  }

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.studentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const student: Student = {
      id: Date.now().toString(),
      ...newStudent,
      createdAt: new Date().toISOString().split("T")[0],
    }

    const updatedStudents = [...students, student]
    setStudents(updatedStudents)
    localStorage.setItem("adminStudents", JSON.stringify(updatedStudents))

    addSystemLog("system", `New student added: ${student.name} (${student.studentId})`, "medium")

    setStats((prev) => ({ ...prev, totalStudents: updatedStudents.length }))
    setShowAddStudent(false)
    setNewStudent({ name: "", email: "", studentId: "", status: "active" })

    toast({
      title: "Success",
      description: "Student added successfully",
    })
  }

  const handleEditStudent = (student: Student) => {
    const updatedStudents = students.map((s) => (s.id === student.id ? student : s))
    setStudents(updatedStudents)
    localStorage.setItem("adminStudents", JSON.stringify(updatedStudents))

    addSystemLog("system", `Student updated: ${student.name} (${student.studentId})`, "medium")

    setEditingStudent(null)
    toast({
      title: "Success",
      description: "Student updated successfully",
    })
  }

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    const updatedStudents = students.filter((s) => s.id !== studentId)
    setStudents(updatedStudents)
    localStorage.setItem("adminStudents", JSON.stringify(updatedStudents))

    if (student) {
      addSystemLog("system", `Student deleted: ${student.name} (${student.studentId})`, "high")
    }

    setStats((prev) => ({ ...prev, totalStudents: updatedStudents.length }))
    toast({
      title: "Success",
      description: "Student deleted successfully",
    })
  }

  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const teacher: Teacher = {
      id: Date.now().toString(),
      ...newTeacher,
      createdAt: new Date().toISOString().split("T")[0],
    }

    const updatedTeachers = [...teachers, teacher]
    setTeachers(updatedTeachers)
    localStorage.setItem("adminTeachers", JSON.stringify(updatedTeachers))

    addSystemLog("system", `New teacher added: ${teacher.name} (${teacher.department})`, "medium")

    setStats((prev) => ({ ...prev, totalTeachers: updatedTeachers.length }))
    setShowAddTeacher(false)
    setNewTeacher({ name: "", email: "", department: "", status: "active" })

    toast({
      title: "Success",
      description: "Teacher added successfully",
    })
  }

  const handleEditTeacher = (teacher: Teacher) => {
    const updatedTeachers = teachers.map((t) => (t.id === teacher.id ? teacher : t))
    setTeachers(updatedTeachers)
    localStorage.setItem("adminTeachers", JSON.stringify(updatedTeachers))

    addSystemLog("system", `Teacher updated: ${teacher.name} (${teacher.department})`, "medium")

    setEditingTeacher(null)
    toast({
      title: "Success",
      description: "Teacher updated successfully",
    })
  }

  const handleDeleteTeacher = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    const updatedTeachers = teachers.filter((t) => t.id !== teacherId)
    setTeachers(updatedTeachers)
    localStorage.setItem("adminTeachers", JSON.stringify(updatedTeachers))

    if (teacher) {
      addSystemLog("system", `Teacher deleted: ${teacher.name} (${teacher.department})`, "high")
    }

    setStats((prev) => ({ ...prev, totalTeachers: updatedTeachers.length }))
    toast({
      title: "Success",
      description: "Teacher deleted successfully",
    })
  }

  const handleSaveSettings = () => {
    localStorage.setItem("systemSettings", JSON.stringify(settings))
    addSystemLog("system", "System settings updated", "medium")
    toast({
      title: "Success",
      description: "Settings saved successfully",
    })
  }

  const handleLogout = () => {
    addSystemLog("login", `Admin logout: ${adminEmail}`, "low")
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuthenticated")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
      case "inactive":
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-4 border-red-200">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-600">Restricted Access</CardTitle>
            <CardDescription>Administrator credentials required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                This portal is for authorized administrators only. All access attempts are logged and monitored.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Administrator Email</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@cec.edu"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter secure password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={handleAdminLogin} className="w-full bg-red-600 hover:bg-red-700">
              Authenticate
            </Button>

            <div className="text-center text-xs text-gray-600">Demo: admin@itproctool.edu / SecureAdmin2024!</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">IT Proctool Admin Portal</h1>
                <p className="text-sm text-red-100">System Administration</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-red-600 border-white hover:bg-red-50 bg-transparent"
            >
              Secure Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeExams}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalViolations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="teachers">Teacher Management</TabsTrigger>
            <TabsTrigger value="system">System Logs</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Student Accounts</CardTitle>
                    <CardDescription>Manage student registrations and access</CardDescription>
                  </div>
                  <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>Create a new student account</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="studentName">Full Name</Label>
                          <Input
                            id="studentName"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            placeholder="Enter student's full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="studentEmail">Email</Label>
                          <Input
                            id="studentEmail"
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            placeholder="student@cec.edu"
                          />
                        </div>
                        <div>
                          <Label htmlFor="studentId">Student ID</Label>
                          <Input
                            id="studentId"
                            value={newStudent.studentId}
                            onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                            placeholder="STU001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="studentStatus">Status</Label>
                          <Select
                            value={newStudent.status}
                            onValueChange={(value: "active" | "suspended") =>
                              setNewStudent({ ...newStudent, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddStudent} className="w-full">
                          Add Student
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-xs text-gray-500">
                          ID: {student.studentId} • Created: {student.createdAt}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                        <div className="flex space-x-1">
                          <Dialog
                            open={editingStudent?.id === student.id}
                            onOpenChange={(open) => !open && setEditingStudent(null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingStudent(student)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Student</DialogTitle>
                                <DialogDescription>Update student information</DialogDescription>
                              </DialogHeader>
                              {editingStudent && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="editStudentName">Full Name</Label>
                                    <Input
                                      id="editStudentName"
                                      value={editingStudent.name}
                                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editStudentEmail">Email</Label>
                                    <Input
                                      id="editStudentEmail"
                                      type="email"
                                      value={editingStudent.email}
                                      onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editStudentId">Student ID</Label>
                                    <Input
                                      id="editStudentId"
                                      value={editingStudent.studentId}
                                      onChange={(e) =>
                                        setEditingStudent({ ...editingStudent, studentId: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editStudentStatus">Status</Label>
                                    <Select
                                      value={editingStudent.status}
                                      onValueChange={(value: "active" | "suspended") =>
                                        setEditingStudent({ ...editingStudent, status: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button onClick={() => handleEditStudent(editingStudent)} className="w-full">
                                    Update Student
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
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {student.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Teacher Accounts</CardTitle>
                    <CardDescription>Manage teacher access and permissions</CardDescription>
                  </div>
                  <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Teacher
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Teacher</DialogTitle>
                        <DialogDescription>Create a new teacher account</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="teacherName">Full Name</Label>
                          <Input
                            id="teacherName"
                            value={newTeacher.name}
                            onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                            placeholder="Enter teacher's full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="teacherEmail">Email</Label>
                          <Input
                            id="teacherEmail"
                            type="email"
                            value={newTeacher.email}
                            onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                            placeholder="teacher@cec.edu"
                          />
                        </div>
                        <div>
                          <Label htmlFor="teacherDepartment">Department</Label>
                          <Input
                            id="teacherDepartment"
                            value={newTeacher.department}
                            onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                            placeholder="Mathematics"
                          />
                        </div>
                        <div>
                          <Label htmlFor="teacherStatus">Status</Label>
                          <Select
                            value={newTeacher.status}
                            onValueChange={(value: "active" | "inactive") =>
                              setNewTeacher({ ...newTeacher, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddTeacher} className="w-full">
                          Add Teacher
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{teacher.name}</h3>
                        <p className="text-sm text-gray-600">{teacher.email}</p>
                        <p className="text-xs text-gray-500">
                          Department: {teacher.department} • Created: {teacher.createdAt}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(teacher.status)}>{teacher.status}</Badge>
                        <div className="flex space-x-1">
                          <Dialog
                            open={editingTeacher?.id === teacher.id}
                            onOpenChange={(open) => !open && setEditingTeacher(null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingTeacher(teacher)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Teacher</DialogTitle>
                                <DialogDescription>Update teacher information</DialogDescription>
                              </DialogHeader>
                              {editingTeacher && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="editTeacherName">Full Name</Label>
                                    <Input
                                      id="editTeacherName"
                                      value={editingTeacher.name}
                                      onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editTeacherEmail">Email</Label>
                                    <Input
                                      id="editTeacherEmail"
                                      type="email"
                                      value={editingTeacher.email}
                                      onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editTeacherDepartment">Department</Label>
                                    <Input
                                      id="editTeacherDepartment"
                                      value={editingTeacher.department}
                                      onChange={(e) =>
                                        setEditingTeacher({ ...editingTeacher, department: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editTeacherStatus">Status</Label>
                                    <Select
                                      value={editingTeacher.status}
                                      onValueChange={(value: "active" | "inactive") =>
                                        setEditingTeacher({ ...editingTeacher, status: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button onClick={() => handleEditTeacher(editingTeacher)} className="w-full">
                                    Update Teacher
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
                                <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {teacher.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTeacher(teacher.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Activity Logs</CardTitle>
                <CardDescription>Monitor system events and security alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                          <Badge variant="outline">{log.type}</Badge>
                        </div>
                        <p className="text-sm">{log.message}</p>
                      </div>

                      <div className="text-right text-sm text-gray-600">
                        <p>{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>Configure global system settings and security parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Security Settings</h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Enable fullscreen requirement</span>
                          <input
                            type="checkbox"
                            checked={settings.fullscreenRequired}
                            onChange={(e) => setSettings({ ...settings, fullscreenRequired: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Tab switching detection</span>
                          <input
                            type="checkbox"
                            checked={settings.tabSwitchingDetection}
                            onChange={(e) => setSettings({ ...settings, tabSwitchingDetection: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Block keyboard shortcuts</span>
                          <input
                            type="checkbox"
                            checked={settings.keyboardShortcutsBlocked}
                            onChange={(e) => setSettings({ ...settings, keyboardShortcutsBlocked: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Disable right-click</span>
                          <input
                            type="checkbox"
                            checked={settings.rightClickDisabled}
                            onChange={(e) => setSettings({ ...settings, rightClickDisabled: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Session timeout (minutes)</span>
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={settings.sessionTimeout / 60}
                            onChange={(e) =>
                              setSettings({ ...settings, sessionTimeout: Number.parseInt(e.target.value) * 60 })
                            }
                          >
                            <option value="15">15</option>
                            <option value="30">30</option>
                            <option value="60">60</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Proctoring Defaults</h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Developer tools detection</span>
                          <input
                            type="checkbox"
                            checked={settings.devToolsDetection}
                            onChange={(e) => setSettings({ ...settings, devToolsDetection: e.target.checked })}
                            className="rounded"
                          />
                        </label>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Inactivity timeout (seconds)</span>
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={settings.inactivityTimeout}
                            onChange={(e) =>
                              setSettings({ ...settings, inactivityTimeout: Number.parseInt(e.target.value) })
                            }
                          >
                            <option value="180">3 minutes</option>
                            <option value="300">5 minutes</option>
                            <option value="600">10 minutes</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Violation threshold</span>
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={settings.violationThreshold}
                            onChange={(e) =>
                              setSettings({ ...settings, violationThreshold: Number.parseInt(e.target.value) })
                            }
                          >
                            <option value="3">3</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={handleSaveSettings} className="bg-red-600 hover:bg-red-700">
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
