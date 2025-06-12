interface Membership {
  fullName: string
  department: string
  cadenceId: number
  position: number
  role: string
  photoFileName: string
}

export interface ExecutiveMember {
  id?: number
  email: string
  phone: string
  about: string
  memberships: Membership[]
}

export interface Cadence {
  id?: number
  name: string
  position: number
  memberIds: number[]
}

export interface CadenceWithMembers {
  id: number
  name: string
  position: number
  members: {
    executiveMemberId: number
    fullName: string
    department: string
    email: string
    phone: string
    about: string
    role: string
    position: number
    photoFileName: string
  }[]
}

export interface PhotoUploadResponse {
  fileName: string
  url: string
}
