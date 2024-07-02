export class UsersDTO {
  constructor(user) {
    this.id = user._id;
    this.first_name = user.first_name;
    this.last_name = user.last_name ? user.last_name : null;
    this.email = user.email;
    this.age = user.age ? user.age : null;
    this.fullName = user.last_name ? `${this.first_name} ${this.last_name}` : this.first_name;
    this.role = user.role ? user.role : "user";
  }
}
